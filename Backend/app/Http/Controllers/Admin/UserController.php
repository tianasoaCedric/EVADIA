<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use LogsAdminAction;

    public function index(Request $request)
    {
        $users = User::with('roles')
            ->when($request->search, fn($q, $s) => $q->where('nom', 'ilike', "%$s%")
                ->orWhere('prenom', 'ilike', "%$s%")
                ->orWhere('email', 'ilike', "%$s%"))
            ->when($request->role, fn($q, $r) => $q->whereHas('roles', fn($rq) => $rq->where('code', $r)))
            ->when($request->status !== null, fn($q) => $q->where('est_actif', $request->boolean('status')))
            ->when(
                $request->sort,
                fn($q, $s) => $q->orderBy($s, $request->direction ?? 'asc'),
                fn($q) => $q->latest('date_inscription')
            )
            ->paginate(20)
            ->withQueryString();

        $roles = Role::all();

        return view('admin.users.index', compact('users', 'roles'));
    }

    public function show(User $user)
    {
        $user->load([
            'roles',
            'profilClient.adresses',
            'profilClient.methodesPaiement',
            'reservations.propriete.hotel',
        ]);

        return view('admin.users.show', compact('user'));
    }

    public function edit(User $user)
    {
        $user->load('roles');
        $roles = Role::all();

        return view('admin.users.edit', compact('user', 'roles'));
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update($request->only(['nom', 'prenom', 'telephone']));

        // Sync roles
        if ($request->has('roles')) {
            $syncData = [];
            foreach ($request->roles as $roleId) {
                $syncData[$roleId] = [
                    'assigned_by' => auth()->id(),
                    'assigned_at' => now(),
                    'est_actif' => true,
                ];
            }
            $user->roles()->sync($syncData);
        }

        $this->logAction('user_updated', "Utilisateur {$user->prenom} {$user->nom} modifié");

        return redirect()->route('admin.users.show', $user)
            ->with('success', 'Utilisateur mis à jour avec succès.');
    }

    public function toggleStatus(User $user)
    {
        $user->update(['est_actif' => !$user->est_actif]);

        $status = $user->est_actif ? 'activé' : 'désactivé';
        $this->logAction('user_status_toggled', "Utilisateur {$user->prenom} {$user->nom} {$status}");

        return back()->with('success', "Utilisateur {$status} avec succès.");
    }
}
