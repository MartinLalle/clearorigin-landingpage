'use client';

import { useEffect } from 'react';

// Scroll reveal — masqué seulement une fois le JS actif (.has-js), avec
// un filet de sécurité : tout est révélé après 3 s même sans scroll.
export default function ScrollReveal() {
	useEffect(() => {
		document.documentElement.classList.add('has-js');
		const reveal = (el: Element) => el.classList.add('is-visible');
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						reveal(entry.target);
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.12 },
		);
		const elements = document.querySelectorAll('.reveal');
		elements.forEach((el) => observer.observe(el));
		const timeout = setTimeout(() => elements.forEach(reveal), 3000);

		return () => {
			observer.disconnect();
			clearTimeout(timeout);
		};
	}, []);

	return null;
}
