@component('mail::message')
@if($etape === 'planifiee')
# Pause planifiée

Bonjour,

À votre demande, **{{ $hotel->nom }}** sera mis en pause sur EVADIA **du {{ $pause->date_debut->format('d/m/Y') }} au {{ $pause->date_reprise->format('d/m/Y') }}**.

Aucune nouvelle réservation ne peut être prise pour ces dates.
@elseif($etape === 'debut')
# Votre hôtel est en pause

Bonjour,

**{{ $hotel->nom }}** n'est plus visible sur EVADIA jusqu'au **{{ $pause->date_reprise->format('d/m/Y') }}**.

- Votre back office reste accessible : vous pouvez préparer votre retour (tarifs, photos, disponibilités).
- La pause est gratuite : les jours d'abonnement déjà payés et non utilisés vous seront rendus à la reprise.
- Pour reprendre plus tôt ou prolonger, contactez l'équipe EVADIA depuis la messagerie.
@elseif($etape === 'rappel')
# Reprise le {{ $pause->date_reprise->format('d/m/Y') }}

Bonjour,

**{{ $hotel->nom }}** redevient visible sur EVADIA le **{{ $pause->date_reprise->format('d/m/Y') }}**.

Pensez à vérifier vos tarifs, vos disponibilités et vos photos avant cette date.
@else
# Votre hôtel est de nouveau en ligne

Bonjour,

La pause de **{{ $hotel->nom }}** est terminée : votre hôtel est de nouveau visible et réservable sur EVADIA.

@if($pause->jours_reportes)
{{ $pause->jours_reportes }} jour(s) d'abonnement non utilisé(s) vous ont été rendus.
@endif
@if($abonnement->date_fin)
Prochaine échéance : **{{ $abonnement->date_fin->format('d/m/Y') }}**.
@endif
@endif

Cordialement,<br>
L'équipe **EVADIA**
@endcomponent
