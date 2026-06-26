
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import './slide-over.scss'

export default function SlideOver(props) {
  const { show, title, setLogin } = props

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog as="div" className="dialog" onClose={setLogin}>
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="dialog-overlay" />
          </Transition.Child>

          <div className="dialog-container">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="container-box">
                <div className="container-box-wrap">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">{title}</Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="slide_orver-button"
                          onClick={() => setLogin(0)}
                        >
                          <span className="sr-only">Close panel</span>
                          X
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-6 px-4 sm:px-6">
                    {/* Replace with your content */}
                    {props.children}
                    {/* /End replace */}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}