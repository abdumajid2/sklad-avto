import { Moon, Warehouse } from "lucide-react";



export default function Header() {

    return (
        <main className=" ">

        
        <header className="bg-gray-600 rounded-2xl flex justify-between  text-white p-4">
            <nav>
                <Warehouse />
            </nav>
            <div>
                <h1 className="text-2xl font-bold">Умный Склад</h1>
            </div>
            <div>
                <Moon />
            </div>
        </header>
        </main>
    )
}