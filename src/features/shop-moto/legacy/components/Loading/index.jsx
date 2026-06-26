import React from 'react'
import './loading.scss'

export default function Loading() {
    return (
        <div className="loading">
           <div className="rounded-md p-4 max-w-sm w-full mx-auto">
                <div className="animate-pulse space-x-4 flex justify-center">
                    <div className="rounded-full bg-red-500 h-12 w-12"></div>
                    <div className="rounded-full bg-green-500 h-12 w-12"></div>
                    <div className="rounded-full bg-yellow-500 h-12 w-12"></div>
                </div>
            </div>  
        </div>
    )
}
