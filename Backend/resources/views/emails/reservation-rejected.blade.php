@component('mail::message')
# Réservation non confirmée

Bonjour **{{ $reservation->client->prenom }} {{ $reservation->client->nom }}**,

Nous sommes désolés de vous informer que votre demande de réservation **{{ $reservation->code_reservation }}** auprès de **{{ $reservation->propriete->hotel->nom }}** n'a pas pu être confirmée.

@component('mail::table')
| Information | Détail |
|:---|:---|
| **Chambre / Propriété** | {{ $reservation->propriete->nom }} |
| **Dates demandées** | Du {{ $reservation->date_debut->format('d/m/Y') }} au {{ $reservation->date_fin->format('d/m/Y') }} |
| **Raison** | {{ $raison }} |
@endcomponent

N'hésitez pas à consulter d'autres disponibilités ou d'autres établissements sur EVADIA.

Cordialement,<br>
L'équipe **EVADIA**
@endcomponent
