"use client";
import React from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Link2 } from "lucide-react";

interface NavBarProps {
  isMenuOpen?: boolean;
  setIsMenuOpen?: (isOpen: boolean) => void;
}

function NavBar({ isMenuOpen, setIsMenuOpen }: NavBarProps) {

  const { data: session } = useSession()

  return (
      <nav className="transition-all duration-300 border-b border bg-white w-full">
        <div className={`flex items-center justify-between w-full py-2 px-8 md:px-44 transition-colors duration-300`}>
          <Link href="/" className="flex items-center gap-2">
            {/* <Image src={rlandLogo} alt="Logo" width={100} height={100} /> */}
            <Link2 className="size-10 text-primary" />
            <h1 className="text-3xl font-bold text-primary">RLink</h1>
          </Link>


          {/* <div className="lg:hidden">
            <Menu
              className="w-6 h-6 cursor-pointer"
              onClick={() => setIsMenuOpen?.(!isMenuOpen)}
            />
          </div> */}
        </div>
       
      </nav>
  );
}

export default NavBar;
