import React, { useState, useEffect } from 'react';
import {
	CardElement,
	useStripe,
	useElements,
	Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { axios, Emitter } from '../../utils';

const promise = loadStripe( process.env.NEXT_PUBLIC_STRIPE_PUBLIC );

export default function StripeWrapper() {
	return (
		<Elements stripe={ promise }>
			<Stripe />
		</Elements>
	);
}

const Stripe = () => {
	const [ succeeded, setSucceeded ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ processing, setProcessing ] = useState( '' );
	const [ disabled, setDisabled ] = useState( true );
	const stripe = useStripe();
	const elements = useElements();

	useEffect( () => {
		const payStripe = async () => {
			try {
				const {
					source,
					error,
				} = await stripe.createSource(
					elements.getElement( CardElement ),
					{
						type: 'card',
					}
				);

				if ( error ) {
					throw Error( error.message );
					setError( `Payment failed ${ error.message }` );
					return null;
				}
				return [
					{ key: 'stripe_source', value: source.id },
					{ key: 'paymentMethod', value: 'stripe' },
					{ key: 'paymentRequestType', value: 'cc' },
					{ key: 'wc-stripe-new-payment-method', value: false },
				];
			} catch ( e ) {
				console.log( e );
			}
		};

		const authStripe = async ( response ) => {
			const {
				payment_intent_secret,
				setup_intent_secret,
				verification_endpoint,
			} = response.payment_result.payment_details.reduce( ( details, { key, value } ) => ( { ...details, [ key ]: value } ) );

			const intentSecret = payment_intent_secret || setup_intent_secret;
			if ( intentSecret ) {
				const confirmationMethod = setup_intent_secret ? 'confirmCardSetup' : 'confirmCardPayment';
				await stripe[ confirmationMethod ]( intentSecret );

				try {
					await axios.get( verification_endpoint );
				} catch ( e ) {
					// Swallow CORS error on HTTP redirect.
					console.log( e );
				}
			}
		};

		try {
			Emitter.on( 'submit', payStripe );
			Emitter.on( 'authenticate', authStripe );
		} catch ( e ) {
			console.log( e );
		}

		return () => {
			Emitter.off( 'submit', payStripe );
			Emitter.off( 'authenticate', authStripe );
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
