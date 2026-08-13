@component('mail::message')
# Réinitialisation de mot de passe

Bonjour **{{ $prenom }}**,

Vous avez demandé à réinitialiser votre mot de passe Evadia.

Voici votre code de vérification :

@component('mail::panel')
<div style="text-align:center; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #01BDA5;">
{{ $code }}
</div>
@endcomponent

Ce code est valable **15 minutes**.

Si vous n'avez pas fait cette demande, ignorez cet email — votre mot de passe restera inchangé.

Cordialement,<br>
L'équipe **Evadia**
@endcomponent
