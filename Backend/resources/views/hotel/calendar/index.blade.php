@extends('layouts.hotel')

@section('title', 'Calendrier - EVADIA')
@section('page_title', 'Calendrier')

@section('content')
<div class="space-y-6" x-data="calendarApp()">
    {{-- Controls --}}
    <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex flex-wrap items-center gap-4">
            <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Propriété</label>
                <select x-model="selectedPropriete" @change="loadData()" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    <option value="">-- Sélectionner --</option>
                    @foreach($proprietes as $p)
                        <option value="{{ $p->id }}">{{ $p->nom }} ({{ ucfirst($p->type_propriete) }}) — {{ $p->nombre_unites }} unité(s)</option>
                    @endforeach
                </select>
            </div>
            <div class="flex items-center gap-2 ml-auto">
                <button @click="prevMonth()" class="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 transition-colors">
                    <svg class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <span class="text-sm font-semibold text-gray-900 min-w-[140px] text-center" x-text="monthLabel"></span>
                <button @click="nextMonth()" class="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 transition-colors">
                    <svg class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    {{-- Calendar Grid --}}
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden relative" x-show="selectedPropriete">
        <div x-show="loading" class="absolute inset-0 bg-white/60 flex items-center justify-center z-10 text-sm text-gray-500">Chargement…</div>
        {{-- Day Headers --}}
        <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            <template x-for="day in ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']">
                <div class="py-2 text-center text-xs font-medium text-gray-500 uppercase" x-text="day"></div>
            </template>
        </div>

        {{-- Calendar Cells --}}
        <div class="grid grid-cols-7">
            <template x-for="(cell, index) in calendarCells" :key="index">
                <div class="min-h-[96px] border-b border-r border-gray-100 p-1.5 transition-colors"
                    :class="{
                        'bg-gray-50/30 opacity-50': !cell.currentMonth,
                        'cursor-pointer hover:bg-gray-50': cell.currentMonth && cell.jour,
                        'bg-red-50/40': cell.jour && etat(cell.jour) === 'complet',
                    }"
                    @click="cell.currentMonth && cell.jour && openDayModal(cell)">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-medium" :class="cell.isToday ? 'text-hotel-600' : (cell.isPast ? 'text-gray-400' : 'text-gray-700')" x-text="cell.day"></span>
                        <span x-show="cell.jour && cell.jour.prix_special" class="text-[10px] font-medium text-hotel-600" x-text="cell.jour ? formatPrix(cell.jour.prix_special) : ''"></span>
                    </div>
                    <template x-if="cell.currentMonth && cell.jour">
                        <div>
                            {{-- Barre d'occupation --}}
                            <div class="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mb-1">
                                <div class="h-full rounded-full" :class="couleurBarre(cell.jour)"
                                    :style="`width: ${cell.jour.ferme ? 100 : Math.max(4, Math.round(cell.jour.occupees / cell.jour.total * 100))}%`"></div>
                            </div>
                            <div class="text-[11px] font-medium" :class="couleurTexte(cell.jour)" x-text="libelleCourt(cell.jour)"></div>
                            <div x-show="!cell.jour.ferme && etat(cell.jour) !== 'complet'" class="text-[10px] text-gray-400"
                                x-text="cell.jour.restantes + ' libre' + (cell.jour.restantes > 1 ? 's' : '')"></div>
                        </div>
                    </template>
                </div>
            </template>
        </div>
    </div>

    {{-- No property selected --}}
    <div x-show="!selectedPropriete" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <svg class="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <p class="text-gray-500">Sélectionnez une propriété pour afficher le calendrier</p>
    </div>

    {{-- Legend --}}
    <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
        <div class="flex items-center gap-1.5"><div class="h-3 w-3 rounded-full bg-emerald-400"></div> Libre</div>
        <div class="flex items-center gap-1.5"><div class="h-3 w-3 rounded-full bg-amber-400"></div> Partiellement occupé</div>
        <div class="flex items-center gap-1.5"><div class="h-3 w-3 rounded-full bg-red-400"></div> Complet</div>
        <div class="flex items-center gap-1.5"><div class="h-3 w-3 rounded-full bg-gray-300"></div> Fermé à la vente</div>
        <div class="flex items-center gap-1.5"><span class="text-hotel-600 font-medium">123</span> Prix spécial</div>
        <div class="text-gray-400">Une nuit compte du jour d'arrivée à la veille du départ.</div>
    </div>

    {{-- Day Modal --}}
    <div x-show="dayModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @keydown.escape.window="dayModal = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" @click.away="dayModal = false">
            <template x-if="selectedCell && selectedCell.jour">
                <div>
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900" x-text="dateLongue(selectedDate)"></h3>
                            <p class="text-sm" :class="couleurTexte(selectedCell.jour)" x-text="libelleLong(selectedCell.jour)"></p>
                        </div>
                        <button type="button" @click="dayModal = false" class="text-gray-400 hover:text-gray-600">
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {{-- Occupation du jour --}}
                    <div class="grid grid-cols-3 gap-3 mb-2">
                        <div class="rounded-lg bg-gray-50 p-3 text-center">
                            <div class="text-xl font-semibold text-gray-900" x-text="selectedCell.jour.total"></div>
                            <div class="text-xs text-gray-500">Total</div>
                        </div>
                        <div class="rounded-lg bg-red-50 p-3 text-center">
                            <div class="text-xl font-semibold text-red-700" x-text="selectedCell.jour.occupees"></div>
                            <div class="text-xs text-red-600">Occupée(s)</div>
                        </div>
                        <div class="rounded-lg bg-emerald-50 p-3 text-center">
                            <div class="text-xl font-semibold text-emerald-700" x-text="selectedCell.jour.ferme ? 0 : selectedCell.jour.restantes"></div>
                            <div class="text-xs text-emerald-600">Disponible(s)</div>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 mb-5"
                        x-text="selectedCell.jour.occupees > 0 ? selectedCell.jour.confirmees + ' confirmée(s) · ' + selectedCell.jour.en_attente + ' en attente de réponse' : ''"></p>

                    {{-- Occupants --}}
                    <h4 class="text-sm font-semibold text-gray-900 mb-2">Occupée par</h4>
                    <p x-show="selectedCell.jour.reservations.length === 0" class="text-sm text-gray-500 mb-5">Aucune réservation cette nuit.</p>
                    <ul x-show="selectedCell.jour.reservations.length > 0" class="divide-y divide-gray-100 border border-gray-100 rounded-lg mb-5">
                        <template x-for="r in selectedCell.jour.reservations" :key="r.id">
                            <li class="flex items-center justify-between gap-3 px-3 py-2">
                                <div class="min-w-0">
                                    <div class="text-sm font-medium text-gray-900 truncate" x-text="r.client"></div>
                                    <div class="text-xs text-gray-500" x-text="r.date_debut + ' → ' + r.date_fin + ' · ' + r.personnes + ' pers.'"></div>
                                </div>
                                <div class="flex items-center gap-2 shrink-0">
                                    <span class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                                        :class="r.statut === 'acceptee' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
                                        x-text="r.statut === 'acceptee' ? 'Confirmée' : 'En attente'"></span>
                                    <a :href="r.url" class="text-xs font-medium text-hotel-600 hover:underline" x-text="r.code"></a>
                                </div>
                            </li>
                        </template>
                    </ul>

                    {{-- Paramètres de vente --}}
                    <h4 class="text-sm font-semibold text-gray-900 mb-2">Paramètres de vente</h4>
                    <p x-show="selectedCell.isPast" class="text-sm text-gray-500">Date passée : consultation uniquement.</p>
                    <form @submit.prevent="saveDayUpdate()" x-show="!selectedCell.isPast">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Vente</label>
                                <select x-model="dayForm.est_disponible" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                                    <option value="1">Ouverte (unités restantes réservables)</option>
                                    <option value="0">Fermée (plus aucune nouvelle réservation)</option>
                                </select>
                                <p class="mt-1 text-xs text-gray-500" x-show="selectedCell.jour.occupees > 0">Fermer la vente ne supprime pas les réservations existantes.</p>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Prix spécial</label>
                                    <input type="number" x-model="dayForm.prix_special" step="0.01" min="0" :placeholder="prixBase ? 'Base : ' + formatPrix(prixBase) : 'Prix de base'"
                                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Minimum nuits</label>
                                    <input type="number" x-model="dayForm.minimum_nuits" min="1" placeholder="1"
                                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                                </div>
                            </div>
                        </div>
                        <p x-show="errorMessage" class="mt-3 text-sm text-red-600" x-text="errorMessage"></p>
                        <div class="flex justify-end gap-3 mt-6">
                            <button type="button" @click="dayModal = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Fermer</button>
                            <button type="submit" class="rounded-lg bg-hotel-600 px-4 py-2 text-sm font-medium text-white hover:bg-hotel-700" :disabled="saving">
                                <span x-show="!saving">Enregistrer</span>
                                <span x-show="saving">Enregistrement...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </template>
        </div>
    </div>

    {{-- Bulk Modal --}}
    <div x-show="bulkModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @keydown.escape.window="bulkModal = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" @click.away="bulkModal = false">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Mise à jour en lot</h3>
            <form @submit.prevent="saveBulkUpdate()">
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                            <input type="date" x-model="bulkForm.date_debut" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                            <input type="date" x-model="bulkForm.date_fin" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Vente</label>
                        <select x-model="bulkForm.est_disponible" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                            <option value="1">Ouverte</option>
                            <option value="0">Fermée</option>
                        </select>
                        <p class="mt-1 text-xs text-gray-500">Les réservations existantes sont conservées.</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Prix spécial</label>
                        <input type="number" x-model="bulkForm.prix_special" step="0.01" min="0" placeholder="Laisser vide = prix de base"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Minimum nuits</label>
                        <input type="number" x-model="bulkForm.minimum_nuits" min="1" placeholder="1"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>
                </div>
                <p x-show="errorMessage" class="mt-3 text-sm text-red-600" x-text="errorMessage"></p>
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" @click="bulkModal = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Annuler</button>
                    <button type="submit" class="rounded-lg bg-hotel-600 px-4 py-2 text-sm font-medium text-white hover:bg-hotel-700" :disabled="saving">Appliquer</button>
                </div>
            </form>
        </div>
    </div>

    {{-- Bulk update button --}}
    <div x-show="selectedPropriete" class="flex justify-end">
        <button @click="errorMessage = ''; bulkModal = true" class="rounded-lg border border-hotel-300 px-4 py-2 text-sm font-medium text-hotel-700 hover:bg-hotel-50 transition-colors">
            Mise à jour en lot
        </button>
    </div>
</div>
@endsection

@push('scripts')
<script>
function calendarApp() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

    return {
        selectedPropriete: '',
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth(),
        jours: {},
        prixBase: null,
        calendarCells: [],
        loading: false,
        dayModal: false,
        bulkModal: false,
        saving: false,
        errorMessage: '',
        selectedDate: '',
        selectedCell: null,
        dayForm: { est_disponible: '1', prix_special: '', minimum_nuits: '' },
        bulkForm: { date_debut: '', date_fin: '', est_disponible: '1', prix_special: '', minimum_nuits: '' },

        get monthLabel() {
            const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
            return months[this.currentMonth] + ' ' + this.currentYear;
        },

        get monthKey() {
            return this.currentYear + '-' + pad(this.currentMonth + 1);
        },

        // ─── État d'une nuit ──────────────────────────────────────────────
        etat(jour) {
            if (jour.ferme) return 'ferme';
            if (jour.occupees >= jour.total) return 'complet';
            if (jour.occupees > 0) return 'partiel';
            return 'libre';
        },

        couleurBarre(jour) {
            return { ferme: 'bg-gray-300', complet: 'bg-red-400', partiel: 'bg-amber-400', libre: 'bg-emerald-400' }[this.etat(jour)];
        },

        couleurTexte(jour) {
            return { ferme: 'text-gray-500', complet: 'text-red-600', partiel: 'text-amber-600', libre: 'text-emerald-600' }[this.etat(jour)];
        },

        libelleCourt(jour) {
            const e = this.etat(jour);
            if (e === 'ferme') return 'Fermé';
            if (e === 'complet') return 'Complet ' + jour.occupees + '/' + jour.total;
            return jour.occupees + '/' + jour.total + ' occupée' + (jour.occupees > 1 ? 's' : '');
        },

        libelleLong(jour) {
            const e = this.etat(jour);
            if (e === 'ferme') return 'Fermé à la vente' + (jour.occupees ? ' — ' + jour.occupees + ' séjour(s) en cours' : '');
            if (e === 'complet') return 'Complet — toutes les unités sont occupées';
            if (e === 'partiel') return jour.restantes + ' unité(s) encore disponible(s)';
            return 'Entièrement libre';
        },

        formatPrix(v) {
            return Number(v).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
        },

        dateLongue(dateStr) {
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        },

        // ─── Navigation / données ─────────────────────────────────────────
        prevMonth() {
            if (this.currentMonth === 0) { this.currentMonth = 11; this.currentYear--; }
            else { this.currentMonth--; }
            this.loadData();
        },

        nextMonth() {
            if (this.currentMonth === 11) { this.currentMonth = 0; this.currentYear++; }
            else { this.currentMonth++; }
            this.loadData();
        },

        async loadData() {
            if (!this.selectedPropriete) { this.jours = {}; this.buildCalendar(); return; }
            this.loading = true;
            try {
                const res = await fetch(`{{ route('hotel.calendar.data') }}?propriete_id=${this.selectedPropriete}&mois=${this.monthKey}`, {
                    headers: { 'Accept': 'application/json' },
                });
                const data = await res.json();
                this.jours = data.jours || {};
                this.prixBase = data.prix_base;
                this.buildCalendar();

                // Garde la fenêtre de détail à jour après un enregistrement
                if (this.dayModal && this.selectedDate) {
                    this.selectedCell = this.calendarCells.find(c => c.date === this.selectedDate) || null;
                }
            } catch (e) { console.error(e); }
            this.loading = false;
        },

        buildCalendar() {
            const firstDay = new Date(this.currentYear, this.currentMonth, 1);
            const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
            let startDow = firstDay.getDay();
            if (startDow === 0) startDow = 7;
            startDow--;

            const cells = [];
            const prevMonthLast = new Date(this.currentYear, this.currentMonth, 0).getDate();
            for (let i = startDow - 1; i >= 0; i--) {
                cells.push({ day: prevMonthLast - i, currentMonth: false, date: null, jour: null });
            }

            for (let d = 1; d <= lastDay.getDate(); d++) {
                const dateStr = this.currentYear + '-' + pad(this.currentMonth + 1) + '-' + pad(d);
                cells.push({
                    day: d,
                    currentMonth: true,
                    date: dateStr,
                    isToday: dateStr === todayStr,
                    isPast: dateStr < todayStr,
                    jour: this.jours[dateStr] || null,
                });
            }

            const remaining = 7 - (cells.length % 7);
            if (remaining < 7) {
                for (let i = 1; i <= remaining; i++) {
                    cells.push({ day: i, currentMonth: false, date: null, jour: null });
                }
            }

            this.calendarCells = cells;
        },

        openDayModal(cell) {
            this.selectedCell = cell;
            this.selectedDate = cell.date;
            this.errorMessage = '';
            this.dayForm = {
                est_disponible: cell.jour.ferme ? '0' : '1',
                prix_special: cell.jour.prix_special || '',
                minimum_nuits: cell.jour.minimum_nuits || '',
            };
            this.dayModal = true;
        },

        async post(url, payload) {
            this.saving = true;
            this.errorMessage = '';
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content, 'Accept': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    this.errorMessage = data.message || 'Enregistrement impossible.';
                    return false;
                }
                await this.loadData();
                return true;
            } catch (e) {
                console.error(e);
                this.errorMessage = 'Erreur réseau, réessayez.';
                return false;
            } finally {
                this.saving = false;
            }
        },

        async saveDayUpdate() {
            await this.post('{{ route("hotel.calendar.update") }}', {
                propriete_id: this.selectedPropriete,
                date: this.selectedDate,
                est_disponible: this.dayForm.est_disponible,
                prix_special: this.dayForm.prix_special || null,
                minimum_nuits: this.dayForm.minimum_nuits || null,
            });
        },

        async saveBulkUpdate() {
            const ok = await this.post('{{ route("hotel.calendar.bulk") }}', {
                propriete_id: this.selectedPropriete,
                date_debut: this.bulkForm.date_debut,
                date_fin: this.bulkForm.date_fin,
                est_disponible: this.bulkForm.est_disponible,
                prix_special: this.bulkForm.prix_special || null,
                minimum_nuits: this.bulkForm.minimum_nuits || null,
            });
            if (ok) this.bulkModal = false;
        },

        init() {
            this.buildCalendar();
        }
    };
}
</script>
@endpush
