@extends('layouts.admin')
@section('title', "Types d'hébergement - EVADIA Admin")
@section('page_title', "Types d'hébergement")

@section('content')
    <div class="flex items-center justify-between mb-6">
        <form method="GET" action="{{ route('admin.types-hebergement.index') }}" class="flex items-end gap-3">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Rechercher un type..."
                class="w-64 rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
            <button type="submit"
                class="rounded-xl bg-evadia-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-evadia-700">Filtrer</button>
        </form>
        <a href="{{ route('admin.types-hebergement.create') }}"
            class="rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouveau type
        </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        @forelse($types as $type)
            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden hover:shadow-md transition-all">
                @if($type->image)
                    <div class="h-40 overflow-hidden">
                        <img src="{{ Storage::disk('s3')->url($type->image) }}" alt="{{ $type->nom }}"
                            class="w-full h-full object-cover">
                    </div>
                @else
                    <div class="h-40 bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                        <svg class="h-14 w-14 text-amber-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0-.75 3.75m0 0-.75 3.75M17.25 7.5l-.75 3.75" />
                        </svg>
                    </div>
                @endif

                <div class="p-5">
                    <div class="flex items-start justify-between">
                        <div>
                            <h3 class="text-sm font-semibold text-gray-900">{{ $type->nom }}</h3>
                            <span class="text-xs text-gray-400">{{ $type->hotels_count }} hôtel(s)</span>
                        </div>
                    </div>
                    @if($type->description)
                        <p class="mt-2 text-xs text-gray-500 line-clamp-2">{{ $type->description }}</p>
                    @endif
                    <div class="mt-3 flex items-center justify-end pt-3 border-t border-gray-100 gap-1">
                        <a href="{{ route('admin.types-hebergement.edit', $type) }}"
                            class="rounded-lg p-1.5 text-gray-400 hover:text-evadia-600 hover:bg-evadia-50 transition-colors" title="Modifier">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </a>
                        <form method="POST" action="{{ route('admin.types-hebergement.destroy', $type) }}" class="inline"
                            onsubmit="return confirm('Supprimer ce type d\'hébergement ?')">
                            @csrf @method('DELETE')
                            <button type="submit"
                                class="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Supprimer">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        @empty
            <div class="col-span-full text-center py-16">
                <p class="text-sm text-gray-400">Aucun type d'hébergement trouvé</p>
            </div>
        @endforelse
    </div>

    <div class="mt-6">{{ $types->links() }}</div>
@endsection
