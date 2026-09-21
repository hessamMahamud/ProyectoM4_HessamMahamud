import type { User } from 'firebase/auth'
import './ProfilePage.css'

interface ProfilePageProps {
    user: User;
    onLogout: () => void;
}

export default function ProfilePage({ user, onLogout }: ProfilePageProps) {
    const userName = user.displayName || user.email?.split('@')[0] || 'Viajero';
    const initials = userName.charAt(0).toUpperCase();

    return (
        <section className="feature-page profile-page">
            <header className="feature-page-header">
                <div>
                    <span className="feature-eyebrow">Tu espacio</span>
                    <h2>Perfil</h2>
                    <p>Administra tus datos y preferencias personales.</p>
                </div>
            </header>

            <section className="profile-identity-card">
                <div className="profile-avatar">{initials}</div>
                <div className="profile-identity-copy">
                    <span className="feature-eyebrow">Cuenta activa</span>
                    <h3>{userName}</h3>
                    <p>{user.email}</p>
                </div>
                <span className="profile-status">En línea</span>
            </section>

            <div className="profile-content-grid">
                <section className="feature-card profile-details-card">
                    <div className="profile-card-heading">
                        <div>
                            <span className="feature-eyebrow">Información</span>
                            <h3>Datos de tu cuenta</h3>
                        </div>
                    </div>
                    <dl className="profile-details-list">
                        <div>
                            <dt>Nombre visible</dt>
                            <dd>{userName}</dd>
                        </div>
                        <div>
                            <dt>Correo electrónico</dt>
                            <dd>{user.email || 'No disponible'}</dd>
                        </div>
                        <div>
                            <dt>Proveedor de acceso</dt>
                            <dd>{user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Correo y contraseña'}</dd>
                        </div>
                    </dl>
                </section>

                <section className="feature-card profile-preferences-card">
                    <div className="profile-card-heading">
                        <div>
                            <span className="feature-eyebrow">Preferencias</span>
                            <h3>Tu experiencia</h3>
                        </div>
                    </div>
                    <div className="profile-preference-row">
                        <span>
                            <strong>Recordatorios tranquilos</strong>
                            <small>Recibe avisos para volver a tu foco</small>
                        </span>
                        <span className="profile-preference-state">Activo</span>
                    </div>
                    <div className="profile-preference-row">
                        <span>
                            <strong>Objetivo diario</strong>
                            <small>Organiza tus prioridades con intención</small>
                        </span>
                        <span className="profile-preference-state">Flexible</span>
                    </div>
                </section>
            </div>

            <button type="button" className="profile-logout-button" onClick={onLogout}>
                Cerrar sesión
            </button>
        </section>
    );
}
