@extends('layouts.admin')
@section('title', 'Formules d\'abonnement - EVADIA Admin')
@section('page_title', 'Formules d\'abonnement')

@section('content')
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p class="text-sm text-gray-500 max-w-2xl">
                Les formules proposées à la création d'un hôtel ou d'un abonnement, et affichées aux hôtels dans « Mon abonnement ».
                Changer un prix ne modifie pas les abonnements en cours. Une formule désactivée n'est plus proposée, mais les hôtels qui l'ont la gardent.
            </p>
            <a href="{{ route('admin.plans.create') }}"
                class="rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 flex items-center gap-2 transition-colors shrink-0">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Nouvelle formule
            </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            @foreach($plans as $plan)
                <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 border-t-4 {{ $plan->border }} flex flex-col {{ $plan->est_actif ? '' : 'opacity-60' }}">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <span class="inline-flex items-center rounded-full {{ $plan->badge_bg }} {{ $plan->badge_text }} px-2.5 py-0.5 text-[11px] font-bold">{{ $plan->label }}</span>
                            <h3 class="mt-2 text-lg font-semibold text-gray-900">{{ $plan->nom }}</h3>
                            <p class="text-xs text-gray-400">Code : {{ $plan->code }} · Ordre : {{ $plan->ordre }}</p>
                        </div>
                        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium {{ $plan->est_actif ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500' }}">
                            {{ $plan->est_actif ? 'Active' : 'Désactivée' }}
                        </span>
                    </div>

                    <p class="mt-4 text-2xl font-bold text-gray-900">
                        {{ number_format($plan->prix, 0, ',', ' ') }} <span class="text-sm font-normal text-gray-500">{{ $plan->devise }} / mois</span>
                    </p>
                    @if($plan->description)
                        <p class="mt-1 text-sm text-gray-500">{{ $plan->description }}</p>
                    @endif

                    <ul class="mt-4 space-y-1.5 text-sm flex-1">
                        @foreach($plan->features ?? [] as $f)
                            <li class="flex items-start gap-2 {{ $f['inclus'] ? 'text-gray-700' : 'text-gray-400 line-through' }}">
                                <span class="{{ $f['inclus'] ? 'text-emerald-500' : 'text-gray-300' }}">{{ $f['inclus'] ? '✓' : '✕' }}</span>
                                {{ $f['texte'] }}
                            </li>
                        @endforeach
                    </ul>

                    <p class="mt-4 text-xs text-gray-500">
                        {{ $utilisation[$plan->code] ?? 0 }} hôtel(s) sur cette formule
                    </p>

                    <div class="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                        <a href="{{ route('admin.plans.edit', $plan) }}"
                            class="rounded-lg bg-evadia-600 px-3 py-2 text-sm font-medium text-white hover:bg-evadia-700">Modifier</a>
                        <form method="POST" action="{{ route('admin.plans.toggle', $plan) }}"
                            data-confirm="{{ $plan->est_actif ? 'Désactiver' : 'Activer' }} la formule {{ $plan->nom }} ?"
                            onsubmit="return confirm(this.dataset.confirm)">
                            @csrf @method('PATCH')
                            <button class="rounded-lg px-3 py-2 text-sm font-medium ring-1 {{ $plan->est_actif ? 'text-red-600 ring-red-200 hover:bg-red-50' : 'text-emerald-700 ring-emerald-200 hover:bg-emerald-50' }}">
                                {{ $plan->est_actif ? 'Désactiver' : 'Activer' }}
                            </button>
                        </form>
                    </div>
                </div>
            @endforeach
        </div>

        @php $orphelins = collect($utilisation)->keys()->diff($plans->pluck('code')); @endphp
        @if($orphelins->isNotEmpty())
            <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Des abonnements utilisent une formule qui n'existe plus : <strong>{{ $orphelins->implode(', ') }}</strong>.
                Ouvrez ces abonnements et choisissez une formule actuelle via « Modifier ».
            </div>
        @endif
    </div>
@endsection
