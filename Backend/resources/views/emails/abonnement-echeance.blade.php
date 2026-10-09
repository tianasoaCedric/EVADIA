@component('mail::message')
@if($etape === 'suspension')
# Hôtel suspendu

Bonjour,

Faute de paiement, l'abonnement de **{{ $hotel->nom }}** (échu le {{ $abonnement->date_fin->format('d/m/Y') }}) a entraîné la suspension de votre hôtel sur EVADIA.

- Votre hôtel n'apparaît plus sur le site et n'accepte plus de nouvelles réservations.
- Les réservations déjà enregistrées restent valables.
- Vous pouvez toujours vous connecter à votre back office.

Dès réception de votre paiement, votre hôtel sera réactivé automatiquement.
@elseif($etape === 'retard')
# Abonnement expiré

Bonjour,

L'abonnement de **{{ $hotel->nom }}** a expiré le **{{ $abonnement->date_fin->format('d/m/Y') }}**.

Votre hôtel reste visible pendant un délai de grâce. **Sans paiement, il sera retiré du site le {{ $suspension->format('d/m/Y') }}.**
@else
# Rappel d'échéance

Bonjour,

L'abonnement de **{{ $hotel->nom }}** expire le **{{ $abonnement->date_fin->format('d/m/Y') }}**.

Pensez à régler le mois suivant pour que votre hôtel reste visible sur EVADIA.
@endif

@component('mail::table')
| Abonnement | |
|:---|:---|
| **Formule** | {{ ucfirst($abonnement->type_abonnement) }} |
| **Montant mensuel** | {{ number_format($abonnement->prix_mensuel, 2, ',', ' ') }} {{ $abonnement->devise }} |
| **Échéance** | {{ $abonnement->date_fin->format('d/m/Y') }} |
@endcomponent

Pour tout paiement ou question, contactez l'équipe EVADIA depuis la messagerie de votre back office.

Cordialement,<br>
L'équipe **EVADIA**
@endcomponent
