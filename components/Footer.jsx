



export default function Footer() {
  return (
    <footer className="border-t border-neutral-700 py-6 px-6 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
        <div>
          <p>&copy; {new Date().getFullYear()} Умный Склад. Все права защищены.</p>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-neutral-300 transition-colors">Справка</a>
          <a href="#" className="hover:text-neutral-300 transition-colors">Поддержка</a>
          <a href="#" className="hover:text-neutral-300 transition-colors">О системе</a>
        </div>
      </div>
    </footer>
  );
}