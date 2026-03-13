@extends('layouts.admin')
@section('title', 'Abonnements - EVADIA Admin')
@section('page_title', 'Abonnements')

@section('content')
    <div class="flex items-center justify-between mb-6">
        <form method="GET" action="{{ route('admin.subscriptions.index') }}" class="flex items-end gap-3">
            <select name="type" class="rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                <option value="">Tous les types</option>
                <option value="basic" {{ request('type') === 'basic' ? 'selected' : '' }}>Basic</option>
                <option value="premium" {{ request('type') === 'premium' ? 'selected' : '' }}>Premium</option>
                <option value="enterprise" {{ request('type') === 'enterprise' ? 'selected' : '' }}>Enterprise</option>
            </select>
            <select name="statut" class="rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                <option value="">Tous les statuts</option>
                <option value="actif" {{ request('statut') === 'actif' ? 'selected' : '' }}>Actif</option>
                <option value="expire" {{ request('statut') === 'expire' ? 'selected' : '' }}>Expiré</option>
            </select>
            <button type="submit" class="rounded-xl bg-evadia-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-evadia-700">Filtrer</button>
        </form>
        <a href="{{ route('admin.subscriptions.create') }}" class="rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Nouvel abonnement
        </a>
    </div>

    <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Hôtel</th>
                    <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Période</th>
                    <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Prix/mois</th>
                    <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th class="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                @forelse($abonnements as $abo)
                    @php $isActive = !$abo->date_fin || $abo->date_fin->isFuture(); @endphp
                    <tr class="hover:bg-gray-50/50">
                        <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ $abo->hotel?->nom }}</td>
                        <td class="px-6 py-4 text-sm text-gray-600">
                            <span class="rounded-full bg-evadia-50 px-2.5 py-0.5 text-xs font-medium text-evadia-700">{{ ucfirst($abo->type_abonnement) }}</span>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-600">{{ $abo->date_debut?->format('d/m/Y') }} → {{ $abo->date_fin?->format('d/m/Y') ?? '∞' }}</td>
                        <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ number_format($abo->prix_mensuel, 2, ',', ' ') }} {{ $abo->devise }}</td>
                        <td class="px-6 py-4">
                            @if($isActive)
                                <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Actif</span>
                            @else
                                <span class="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700"><span class="h-1.5 w-1.5 rounded-full bg-red-500"></span> Expiré</span>
                            @endif
                        </td>
                        <td class="px-6 py-4 text-right">
                            <a href="{{ route('admin.subscriptions.show', $abo) }}" class="rounded-lg p-1.5 text-gray-400 hover:text-evadia-600 hover:bg-evadia-50 transition-colors inline-block">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </a>
                            <a href="{{ route('admin.subscriptions.edit', $abo) }}" class="rounded-lg p-1.5 text-gray-400 hover:text-evadia-600 hover:bg-evadia-50 transition-colors inline-block">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                            </a>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="px-6 py-12 text-center text-sm text-gray-400">Aucun abonnement</td></tr>
                @endforelse
            </tbody>
        </table>
        <div class="border-t border-gray-100 px-6 py-4">{{ $abonnements->links() }}</div>
    </div>
@endsection
