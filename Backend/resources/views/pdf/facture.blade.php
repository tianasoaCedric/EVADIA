<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #222; }
        h1 { font-size: 20px; margin-bottom: 0; }
        .subtitle { color: #666; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
        th { background: #f5f5f5; }
        .totals { margin-top: 20px; width: 50%; margin-left: auto; }
        .totals td { border: none; }
        .totals .total-row td { font-weight: bold; border-top: 2px solid #222; }
        .header-row { display: table; width: 100%; margin-bottom: 20px; }
        .col { display: table-cell; width: 50%; vertical-align: top; }
        .footer { margin-top: 40px; font-size: 10px; color: #888; }
    </style>
</head>
<body>
    <h1>Facture {{ $facture->numero_facture }}</h1>
    <p class="subtitle">Émise le {{ $facture->date_emission->format('d/m/Y') }}</p>

    <div class="header-row">
        <div class="col">
            <strong>Émis par</strong><br>
            {{ $reservation->propriete->hotel->nom }}<br>
            {{ $reservation->propriete->nom }}
        </div>
        <div class="col">
            <strong>Facturé à</strong><br>
            {{ $reservation->client->prenom }} {{ $reservation->client->nom }}<br>
            {{ $reservation->client->email }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Arrivée</th>
                <th>Départ</th>
                <th>Voyageurs</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Réservation {{ $reservation->code_reservation }}</td>
                <td>{{ $reservation->date_debut->format('d/m/Y') }}</td>
                <td>{{ $reservation->date_fin->format('d/m/Y') }}</td>
                <td>{{ $reservation->nb_adultes }} adulte(s), {{ $reservation->nb_enfants }} enfant(s), {{ $reservation->nb_bebes }} bébé(s)</td>
            </tr>
        </tbody>
    </table>

    <table class="totals">
        @if($reservation->prix_avant_reduction)
            <tr>
                <td>Prix avant réduction</td>
                <td>{{ number_format((float) $reservation->prix_avant_reduction, 2) }} {{ $reservation->devise_prix_total }}</td>
            </tr>
            <tr>
                <td>Réduction ({{ $reservation->code_promo_utilise }})</td>
                <td>- {{ number_format((float) $reservation->montant_reduction, 2) }} {{ $reservation->devise_prix_total }}</td>
            </tr>
        @endif
        <tr class="total-row">
            <td>Total</td>
            <td>{{ number_format((float) $facture->montant_total, 2) }} {{ $facture->devise }}</td>
        </tr>
    </table>

    <p class="footer">EVADIA — Cette facture est générée automatiquement, aucune signature n'est requise.</p>
</body>
</html>
