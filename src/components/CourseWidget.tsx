'use client';

export default function CourseWidget() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Horaire des cours</h2>
      <div className="w-full overflow-hidden rounded-lg border dark:border-zinc-700">
        <iframe
          src="https://www.gorendezvous.com/BookingWidget/?companyId=108450&classesOnly=1&buttons-backgroundColor=%230088cc&buttons-color=%23ffffff&jumptodate=firstevents&culture=fr-CA"
          style={{ border: 'none', width: '100%', height: '600px' }}
          title="Horaire des cours - Gym du Plateau"
        />
      </div>
      <p className="mt-3 text-sm text-zinc-500">
        Widget de réservation GoRendezVous - Gym du Plateau
      </p>
    </div>
  );
}
