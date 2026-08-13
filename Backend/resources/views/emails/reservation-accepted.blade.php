@component('mail::message')
# Réservation confirmée !

Bonjour **{{ $reservation->client->prenom }} {{ $reservation->client->nom }}**,

Bonne nouvelle : votre demande de réservation **{{ $reservation->code_reservation }}** a été **acceptée** par l'hôtel **{{ $reservation->propriete->hotel->nom }}**.

@component('mail::table')
| Information | Détail |
|:---|:---|
| **Chambre / Propriété** | {{ $reservation->propriete->nom }} |
| **Arrivée** | {{ $reservation->date_debut->format('d/m/Y') }} |
| **Départ** | {{ $reservation->date_fin->format('d/m/Y') }} |
| **Voyageurs** | {{ $reservation->nb_adultes }} adulte(s), {{ $reservation->nb_enfants }} enfant(s) |
| **Montant total** | {{ number_format((float) $reservation->prix_total, 2) }} {{ $reservation->devise_prix_total }} |
@if($reservation->acompteRequis())
| **Acompte payé** | {{ number_format((float) $reservation->montant_acompte, 2) }} {{ $reservation->devise_prix_total }} |
| **Solde restant à régler à l'arrivée** | {{ number_format($reservation->soldeRestant(), 2) }} {{ $reservation->devise_prix_total }} |
@endif
| **N° de facture** | {{ $facture->numero_facture }} |
@endcomponent

Vous trouverez votre facture en pièce jointe à cet email.

Cordialement,<br>
L'équipe **EVADIA**
@endcomponent
