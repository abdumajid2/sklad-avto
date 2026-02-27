






export default function Main() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-primary-400 via-secondary-400 to-primary-400 bg-clip-text text-transparent animate-fadeIn">
          ДОБРО ПОЖАЛОВАТЬ
        </h1>
        <p className="text-lg md:text-xl text-neutral-300 font-light max-w-xl mx-auto">
          Система управления складом нового поколения
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <div className="badge badge-primary">Быстро</div>
          <div className="badge badge-success">Надёжно</div>
          <div className="badge badge-secondary">Удобно</div>
        </div>
      </div>
    </main>
  );
}