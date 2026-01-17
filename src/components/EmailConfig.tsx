'use client';

interface Props {
  email: string;
  notifyOnNewCourse: boolean;
  onEmailChange: (email: string) => void;
  onNotifyChange: (notify: boolean) => void;
}

export default function EmailConfig({
  email,
  notifyOnNewCourse,
  onEmailChange,
  onNotifyChange,
}: Props) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Email pour les notifications
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => onEmailChange(e.target.value)}
            placeholder="votre@email.com"
            className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={notifyOnNewCourse}
            onChange={e => onNotifyChange(e.target.checked)}
            className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            M'envoyer un email quand un nouveau cours correspond à mes disponibilités
          </span>
        </label>
      </div>
    </div>
  );
}
