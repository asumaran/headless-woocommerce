import React, { useState, useEffect } from 'react';
import {
	CardElement,
	useStripe,
	useElements,
	Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { axios, Emitter } from '../../utils';

const promise = loadStripe( process.env.NEXT_PUBLIC_WCPAY_PUBLIC_KEY, {
	stripeAccount: process.env.NEXT_PUBLIC_WCPAY_STRIPE_ACCOUNT,
} );

export default function StripeWrapper() {
	return (
		<Elements stripe={ promise }>
			<WCPay />
		</Elements>
	);
}

const WCPay = () => {
	const [ succeeded, setSucceeded ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ processing, setProcessing ] = useState( '' );
	const [ disabled, setDisabled ] = useState( true );
	const stripe = useStripe();
	const elements = useElements();

	useEffect( () => {
		const payWCPay = async () => {
			try {
				const {
					paymentMethod,
					error,
				} = await stripe.createPaymentMethod( {
					type: 'card',
					card: elements.getElement( CardElement ),
				} );
				if ( error ) {
					throw Error( error.message );
					setError( `Payment failed ${ error.message }` );
					return null;
				}
				return [
					{ key: 'wcpay-payment-method', value: paymentMethod.id },
					{ key: 'paymentMethod', value: 'woocommerce_payments' },
				];
			} catch ( e ) {
				console.log( e );
			}
		};

		const authWCPay = async ( response ) => {
			const paymentDetails = response.payment_result.payment_details.reduce( ( details, { key, value } ) => ( { ...details, [ key ]: value } ) );
			const partials = paymentDetails.redirect.match( /#wcpay-confirm-(pi|si):(.+):(.+):(.+)$/ );

			if ( partials ) {
				const thingToConfirm = 'si' === partials[ 1 ] ? 'Setup' : 'Payment';
				const result = await stripe[ 'confirmCard' + thingToConfirm ]( partials[ 3 ] );

				const formData = new FormData();
				formData.append( 'action', 'update_order_status' );
				formData.append( '_ajax_nonce', partials[ 4 ] );
				formData.append( 'order_id', partials[ 2 ] );
				formData.append( 'intent_id', result.paymentIntent?.id || result.setupIntent?.id );

				const ajaxUrl = process.env.NEXT_PUBLIC_STORE_API.replace( '/wp-json/wc/store', '/wp-admin/admin-ajax.php' );
				await axios.post( ajaxUrl, formData );
			}
		};

		try {
			Emitter.on( 'submit', payWCPay );
			Emitter.on( 'authenticate', authWCPay );
		} catch ( e ) {
			console.log( e );
		}

		return () => {
			Emitter.off( 'submit', payWCPay );
			Emitter.off( 'authenticate', authWCPay );
		};
	}, [ stripe, elements ] );
	const handleChange = async ( event ) => {
		// Listen for changes in the CardElement
		// and display any errors as the customer types their card details
		setDisabled( event.empty );
		setError( event.error ? event.error.message : '' );
	};

	return (
		<CardElement
			id="card-element"
			onChange={ handleChange }
			hidePostalCode={ false }
		/>
	);
};
