import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Echo / Reverb – messagerie en temps réel des back offices.
 *
 * La configuration est injectée par le layout (window.EVADIA_REVERB) au moment
 * du rendu : la clé ne dépend pas du build. Le WebSocket passe par nginx
 * (même hôte, /app/<clé>) et l'autorisation des canaux privés par
 * /broadcasting/auth (session Laravel + jeton CSRF lu dans la balise meta).
 *
 * Une seule souscription par page : chaque message reçu est relayé en
 * événement DOM « evadia-message » que les pages et composants écoutent.
 */
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const config = window.EVADIA_REVERB || {};
const key = config.key || import.meta.env.VITE_REVERB_APP_KEY;
const https = window.location.protocol === 'https:';

if (key) {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key,
        wsHost: window.location.hostname,
        wsPort: window.location.port || (https ? 443 : 80),
        wssPort: window.location.port || 443,
        forceTLS: https,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
    });

    if (config.userId) {
        window.Echo.private(`messages.${config.userId}`)
            .listen('.message.sent', (message) => {
                window.dispatchEvent(new CustomEvent('evadia-message', { detail: message }));
            });
    }
}

/** Échappe un texte avant insertion dans du HTML (contenu saisi par un utilisateur). */
window.evadiaEscape = (texte) => String(texte ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Recharge sans rechargement de page les blocs marqués data-live="<nom>" :
 * la page courante est redemandée et chaque bloc est remplacé par sa nouvelle version.
 */
window.evadiaRefreshLive = async () => {
    try {
        const res = await fetch(window.location.href, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        if (!res.ok) return;
        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        document.querySelectorAll('[data-live]').forEach((bloc) => {
            const nouveau = doc.querySelector(`[data-live="${bloc.dataset.live}"]`);
            if (nouveau) bloc.innerHTML = nouveau.innerHTML;
        });
    } catch (e) {
        // Réseau indisponible : la liste sera à jour au prochain message ou chargement.
    }
};
