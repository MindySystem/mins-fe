import React from 'react';
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import './modal.scss'
import { AiOutlineCloseCircle } from 'react-icons/ai'

export default function Modal(props) {
  const { show, setShow, title, size } = props

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog as="div" className="modal-dialog z-50" onClose={setShow}>
        <div className="modal-dialog-container">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-400"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="dialog-ovelay" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className={`container-content ${size ? size : 'sm:max-w-2xl'}`}>
              <h1 className="title">{title}</h1>
              <span className="container-content-close" onClick={() => setShow(false)}>
                <AiOutlineCloseCircle />
              </span>
              <div>
                {props.children}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}