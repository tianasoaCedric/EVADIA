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
                        <option value="{{ $p->id }}">{{ $p->nom }} ({{ ucfirst($p->type_propriete) }})</option>
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
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden" x-show="selectedPropriete">
        {{-- Day Headers --}}
        <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            <template x-for="day in ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']">
                <div class="py-2 text-center text-xs font-medium text-gray-500 uppercase" x-text="day"></div>
            </template>
        </div>

        {{-- Calendar Cells --}}
        <div class="grid grid-cols-7">
            <template x-for="(cell, index) in calendarCells" :key="index">
                <div class="min-h-[90px] border-b border-r border-gray-100 p-1.5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    :class="{ 'bg-gray-50/30': !cell.currentMonth, 'opacity-50': !cell.currentMonth }"
                    @click="cell.currentMonth && cell.date && openDayModal(cell)">
                    <div class="text-xs font-medium mb-1" :class="cell.isToday ? 'text-hotel-600' : 'text-gray-700'" x-text="cell.day"></div>
                    <template x-if="cell.currentMonth && cell.date">
                        <div>
                            {{-- Status indicator --}}
                            <div class="h-1.5 w-full rounded-full mb-1"
                                :class="{
                                    'bg-red-400': cell.hasReservation,
                                    'bg-gray-300': !cell.hasReservation && cell.disponibilite && !cell.disponibilite.est_disponible,
                                    'bg-emerald-400': !cell.hasReservation && (!cell.disponibilite || cell.disponibilite.est_disponible)
                                }"></div>
                            {{-- Price --}}
                            <div class="text-[10px] font-medium"
                                :class="cell.disponibilite && cell.disponibilite.prix_special ? 'text-hotel-600' : 'text-gray-400'"
                                x-text="cell.disponibilite && cell.disponibilite.prix_special ? cell.disponibilite.prix_special + '' : (prixBase ? prixBase + '' : '')"></div>
                            {{-- Reservation info --}}
                            <template x-if="cell.reservationInfo">
                                <div class="mt-0.5 text-[10px] text-red-600 truncate" x-text="cell.reservationInfo"></div>
                            </template>
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
    <div class="flex items-center gap-6 text-xs text-gray-500">
        <div class="flex items-center gap-1.5"><div class="h-3 w-3 rounded-full bg-emerald-400"></div> Disponible</div>
        <div class="flex items-center gap-1.5"><div class="h-3 w-3 rounded-full bg-red-400"></div> Réservé</div>
        <div class="flex items-center gap-1.5"><div class="h-3 w-3 rounded-full bg-gray-300"></div> Indisponible</div>
        <div class="flex items-center gap-1.5"><span class="text-hotel-600 font-medium">123</span> Prix spécial</div>
    </div>

    {{-- Day Modal --}}
    <div x-show="dayModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @keydown.escape.window="dayModal = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" @click.away="dayModal = false">
            <h3 class="text-lg font-semibold text-gray-900 mb-1" x-text="'Modifier le ' + selectedDate"></h3>
            <p class="text-sm text-gray-500 mb-4" x-show="selectedCell && selectedCell.hasReservation">Cette date a une réservation active et ne peut pas être modifiée.</p>

            <form @submit.prevent="saveDayUpdate()" x-show="!selectedCell || !selectedCell.hasReservation">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
                        <select x-model="dayForm.est_disponible" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                            <option value="1">Disponible</option>
                            <option value="0">Indisponible</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Prix spécial</label>
                        <input type="number" x-model="dayForm.prix_special" step="0.01" min="0" placeholder="Laisser vide = prix de base"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Minimum nuits</label>
                        <input type="number" x-model="dayForm.minimum_nuits" min="1" placeholder="1"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" @click="dayModal = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Annuler</button>
                    <button type="submit" class="rounded-lg bg-hotel-600 px-4 py-2 text-sm font-medium text-white hover:bg-hotel-700" :disabled="saving">
                        <span x-show="!saving">Enregistrer</span>
                        <span x-show="saving">Enregistrement...</span>
                    </button>
                </div>
            </form>
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
                        <label class="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
                        <select x-model="bulkForm.est_disponible" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                            <option value="1">Disponible</option>
                            <option value="0">Indisponible</option>
                        </select>
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
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" @click="bulkModal = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Annuler</button>
                    <button type="submit" class="rounded-lg bg-hotel-600 px-4 py-2 text-sm font-medium text-white hover:bg-hotel-700" :disabled="saving">Appliquer</button>
                </div>
            </form>
        </div>
    </div>

    {{-- Bulk update button --}}
    <div x-show="selectedPropriete" class="flex justify-end">
        <button @click="bulkModal = true" class="rounded-lg border border-hotel-300 px-4 py-2 text-sm font-medium text-hotel-700 hover:bg-hotel-50 transition-colors">
            Mise à jour en lot
        </button>
    </div>
</div>
@endsection

@push('scripts')
<script>
function calendarApp() {
    const now = new Date();
    return {
        selectedPropriete: '',
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth(),
        disponibilites: {},
        reservations: [],
        prixBase: null,
        calendarCells: [],
        dayModal: false,
        bulkModal: false,
        saving: false,
        selectedDate: '',
        selectedCell: null,
        dayForm: { est_disponible: '1', prix_special: '', minimum_nuits: '' },
        bulkForm: { date_debut: '', date_fin: '', est_disponible: '1', prix_special: '', minimum_nuits: '' },

        get monthLabel() {
            const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
            return months[this.currentMonth] + ' ' + this.currentYear;
        },

        get monthKey() {
            return this.currentYear + '-' + String(this.currentMonth + 1).padStart(2, '0');
        },

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
            if (!this.selectedPropriete) return;
            try {
                const res = await fetch(`{{ route('hotel.calendar.data') }}?propriete_id=${this.selectedPropriete}&mois=${this.monthKey}`);
                const data = await res.json();
                this.disponibilites = data.disponibilites || {};
                this.reservations = data.reservations || [];
                this.prixBase = data.prix_base;
                this.buildCalendar();
            } catch (e) { console.error(e); }
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
                cells.push({ day: prevMonthLast - i, currentMonth: false, date: null });
            }

            const today = new Date();
            for (let d = 1; d <= lastDay.getDate(); d++) {
                const dateStr = this.currentYear + '-' + String(this.currentMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
                const isToday = today.getFullYear() === this.currentYear && today.getMonth() === this.currentMonth && today.getDate() === d;
                const dispo = this.disponibilites[dateStr] || null;
                const reservation = this.reservations.find(r => r.date_debut <= dateStr && r.date_fin > dateStr);
                cells.push({
                    day: d,
                    currentMonth: true,
                    date: dateStr,
                    isToday,
                    disponibilite: dispo,
                    hasReservation: !!reservation,
                    reservationInfo: reservation ? (reservation.client?.prenom || '') + ' ' + (reservation.client?.nom || '') : null,
                });
            }

            const remaining = 7 - (cells.length % 7);
            if (remaining < 7) {
                for (let i = 1; i <= remaining; i++) {
                    cells.push({ day: i, currentMonth: false, date: null });
                }
            }

            this.calendarCells = cells;
        },

        openDayModal(cell) {
            this.selectedCell = cell;
            this.selectedDate = cell.date;
            this.dayForm = {
                est_disponible: cell.disponibilite ? (cell.disponibilite.est_disponible ? '1' : '0') : '1',
                prix_special: cell.disponibilite?.prix_special || '',
                minimum_nuits: cell.disponibilite?.minimum_nuits || '',
            };
            this.dayModal = true;
        },

        async saveDayUpdate() {
            this.saving = true;
            try {
                const res = await fetch('{{ route("hotel.calendar.update") }}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content, 'Accept': 'application/json' },
                    body: JSON.stringify({
                        propriete_id: this.selectedPropriete,
                        date: this.selectedDate,
                        est_disponible: this.dayForm.est_disponible,
                        prix_special: this.dayForm.prix_special || null,
                        minimum_nuits: this.dayForm.minimum_nuits || null,
                    })
                });
                const data = await res.json();
                if (data.success) { this.dayModal = false; this.loadData(); }
            } catch (e) { console.error(e); }
            this.saving = false;
        },

        async saveBulkUpdate() {
            this.saving = true;
            try {
                const res = await fetch('{{ route("hotel.calendar.bulk") }}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content, 'Accept': 'application/json' },
                    body: JSON.stringify({
                        propriete_id: this.selectedPropriete,
                        date_debut: this.bulkForm.date_debut,
                        date_fin: this.bulkForm.date_fin,
                        est_disponible: this.bulkForm.est_disponible,
                        prix_special: this.bulkForm.prix_special || null,
                        minimum_nuits: this.bulkForm.minimum_nuits || null,
                    })
                });
                const data = await res.json();
                if (data.success) { this.bulkModal = false; this.loadData(); }
            } catch (e) { console.error(e); }
            this.saving = false;
        },

        init() {
            this.buildCalendar();
        }
    };
}
</script>
@endpush
