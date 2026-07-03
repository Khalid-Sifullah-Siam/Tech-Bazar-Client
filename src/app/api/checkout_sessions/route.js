import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const planName = formData.get('planName')
    const submittedPriceId = formData.get('priceId')
    const priceId = submittedPriceId === 'price_REPLACE_ME' ? '' : submittedPriceId
    const productId = formData.get('productId')
    const origin = new URL(request.url).origin

    let userSession = null

    try {
      userSession = await auth.api.getSession({
        headers: await headers()
      })
    } catch (error) {
      userSession = null
    }

    if (!userSession?.user) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    if (!planName || (!priceId && !productId)) {
      return NextResponse.json(
        { error: 'Invalid plan information' },
        { status: 400 }
      )
    }

    let finalPriceId = priceId

    if (!finalPriceId && productId) {
      const priceList = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 10,
      })

      const monthlyPrice = priceList.data.find((price) => {
        return price.recurring?.interval === 'month'
      })

      if (!monthlyPrice) {
        return NextResponse.json(
          { error: 'No active monthly price found for this product' },
          { status: 400 }
        )
      }

      finalPriceId = monthlyPrice.id
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: userSession.user.email,
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      metadata: {
        planName,
        priceId: finalPriceId,
        userId: userSession.user.id,
        userEmail: userSession.user.email,
      },
      mode: 'subscription',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
    });

    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}
