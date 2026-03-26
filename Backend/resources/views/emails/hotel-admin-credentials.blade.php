@component('mail::message')
# Bienvenue sur EVADIA

Bonjour **{{ $adminUser->prenom }} {{ $adminUser->nom }}**,

Votre hôtel **{{ $hotel->nom }}** a été ajouté sur la plateforme EVADIA.

Voici vos identifiants de connexion :

@component('mail::table')
| Information | Valeur |
|:---|:---|
| **Email** | {{ $adminUser->email }} |
| **Mot de passe temporaire** | 0000 |
@endcomponent

@component('mail::button', ['url' => $loginUrl])
Se connecter
@endcomponent

> **Important :** Vous serez invité à modifier votre mot de passe lors de votre première connexion.

Si vous avez des questions, contactez-nous via la messagerie EVADIA.

Cordialement,<br>
L'équipe **EVADIA**
@endcomponent