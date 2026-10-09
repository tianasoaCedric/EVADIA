{{-- Statut courant de l'hôtel (table hotel_statuts). Usage : @include('hotel.partials.statut-badge', ['hotel' => $hotel]) --}}
@php
    $statut = $hotel->currentStatut?->statut;
    $styles = [
        'actif'      => ['bg-emerald-50 text-emerald-700 ring-emerald-600/20', 'bg-emerald-500', 'Actif'],
        'en_attente' => ['bg-amber-50 text-amber-700 ring-amber-600/20', 'bg-amber-500', 'En attente d\'activation'],
        'suspendu'   => ['bg-red-50 text-red-700 ring-red-600/20', 'bg-red-500', 'Suspendu'],
        'inactif'    => ['bg-gray-50 text-gray-700 ring-gray-500/20', 'bg-gray-400', 'Inactif'],
    ];
    [$classes, $dot, $libelle] = $styles[$statut] ?? ['bg-gray-50 text-gray-700 ring-gray-500/20', 'bg-gray-400', $statut ? ucfirst(str_replace('_', ' ', $statut)) : 'Non défini'];
@endphp
<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset {{ $classes }}"
    @if($hotel->currentStatut?->raison) title="{{ $hotel->currentStatut->raison }}" @endif>
    <span class="h-1.5 w-1.5 rounded-full {{ $dot }}"></span>
    {{ $libelle }}
</span>
