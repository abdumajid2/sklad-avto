
import ProductsPage from "./products/page";

export default function Home() {


  return (
    <header className= " max-w-300 mx-auto p-5   ">
        
        <main className="flex flex-col items-center p-5 justify-center h-full">
           
            <ProductsPage/>
        </main>
    </header>
  )
}