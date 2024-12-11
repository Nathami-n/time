
import { Outlet } from '@remix-run/react'
import { Logo } from '~/components/logo'

export default function Authlayout() {
    return (
        <div className='flex items-center justify-center w-full h-screen'>
            <div className="flex items-center flex-col">
                <div className="mb-4">
                    <Logo />
                </div>
                <div>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
