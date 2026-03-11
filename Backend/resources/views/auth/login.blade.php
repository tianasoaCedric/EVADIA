<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion - EVADIA</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a, #1e3a5f, #0f172a);
        }
        .container { width: 100%; max-width: 400px; padding: 0 20px; }
        .logo { text-align: center; margin-bottom: 32px; }
        .logo h1 { font-size: 2.2rem; color: #fff; letter-spacing: 2px; }
        .logo p { color: #93c5fd; font-size: 0.85rem; margin-top: 6px; }
        .card {
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .card h2 { color: #fff; font-size: 1.2rem; margin-bottom: 24px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; color: #bfdbfe; font-size: 0.85rem; margin-bottom: 6px; }
        input[type="email"], input[type="password"], input[type="text"] {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 10px;
            color: #fff;
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.2s;
        }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input:focus { border-color: #60a5fa; }
        .password-wrapper { position: relative; }
        .toggle-pw {
            position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
            background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer;
            font-size: 0.8rem;
        }
        .toggle-pw:hover { color: #fff; }
        .btn {
            width: 100%;
            padding: 12px;
            background: #2563eb;
            color: #fff;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn:hover { background: #3b82f6; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .alert {
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 0.85rem;
            margin-bottom: 16px;
            display: none;
        }
        .alert-error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
        .alert-success { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #86efac; }
        .footer { text-align: center; color: rgba(255,255,255,0.25); font-size: 0.7rem; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>EVADIA</h1>
            <p>Votre plateforme de reservation</p>
        </div>

        <div class="card">
            <h2>Connexion</h2>

            <div id="error-message" class="alert alert-error"></div>
            <div id="success-message" class="alert alert-success"></div>

            <form id="login-form">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required autofocus placeholder="votre@email.com">
                </div>

                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <div class="password-wrapper">
                        <input type="password" id="password" name="password" required placeholder="••••••••">
                        <button type="button" class="toggle-pw" id="toggle-password">Voir</button>
                    </div>
                </div>

                <button type="submit" class="btn" id="submit-btn">Se connecter</button>
            </form>
        </div>

        <p class="footer">&copy; 2026 EVADIA. Tous droits reserves.</p>
    </div>

    <script>
        const form = document.getElementById('login-form');
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');
        const submitBtn = document.getElementById('submit-btn');
        const togglePw = document.getElementById('toggle-password');
        const pwInput = document.getElementById('password');

        togglePw.addEventListener('click', function () {
            const show = pwInput.type === 'password';
            pwInput.type = show ? 'text' : 'password';
            togglePw.textContent = show ? 'Cacher' : 'Voir';
        });

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Connexion...';

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        email: document.getElementById('email').value,
                        password: pwInput.value
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || data.errors?.email?.[0] || 'Erreur de connexion.');
                }

                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                successDiv.textContent = 'Bienvenue, ' + data.user.prenom + ' ' + data.user.nom + ' !';
                successDiv.style.display = 'block';

                setTimeout(() => { window.location.href = '/'; }, 1000);

            } catch (err) {
                errorDiv.textContent = err.message;
                errorDiv.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Se connecter';
            }
        });
    </script>
</body>
</html>
