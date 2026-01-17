'use client';

import { useState, useEffect } from 'react';
import { UserConfig } from '@/types';
import { getConfig, saveConfig, getDefaultConfig } from '@/lib/storage';
import AvailabilityForm from '@/components/AvailabilityForm';
import EmailConfig from '@/components/EmailConfig';
import CourseWidget from '@/components/CourseWidget';

export default function Home() {
  const [config, setConfig] = useState<UserConfig>(getDefaultConfig);
  const [activeTab, setActiveTab] = useState<'schedule' | 'settings'>('schedule');
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const stored = getConfig();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfig(stored);
    }
  }, []);

  const handleSave = async () => {
    // Sauvegarder localement
    saveConfig(config);
    setSaved(true);

    // Synchroniser avec le serveur si email configuré
    if (config.email) {
      setSyncing(true);
      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        });
      } catch (error) {
        console.error('Erreur sync serveur:', error);
      }
      setSyncing(false);
    }

    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestNotification = async () => {
    if (!config.email) {
      alert('Veuillez entrer votre email');
      return;
    }

    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: config.email,
          subject: 'Test - Gym Tracker',
          message: 'Ceci est un test de notification. Votre configuration fonctionne !',
        }),
      });

      if (response.ok) {
        alert('Email de test envoyé !');
      } else {
        const data = await response.json();
        alert(`Erreur: ${data.error}`);
      }
    } catch {
      alert('Erreur lors de l\'envoi');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Gym du Plateau - Tracker
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Surveillez les cours et recevez des notifications
          </p>
        </div>
      </header>

      <nav className="bg-white dark:bg-zinc-900 border-b dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'schedule'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Horaire
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Paramètres
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'schedule' ? (
          <CourseWidget />
        ) : (
          <div className="space-y-6">
            <AvailabilityForm
              availability={config.availability}
              onChange={availability => setConfig({ ...config, availability })}
            />

            <EmailConfig
              email={config.email}
              notifyOnNewCourse={config.notifyOnNewCourse}
              onEmailChange={email => setConfig({ ...config, email })}
              onNotifyChange={notifyOnNewCourse =>
                setConfig({ ...config, notifyOnNewCourse })
              }
            />

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={syncing}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
              >
                {syncing ? 'Synchronisation...' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
              </button>

              <button
                onClick={handleTestNotification}
                className="px-6 py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-medium rounded-lg transition-colors"
              >
                Tester les notifications
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
