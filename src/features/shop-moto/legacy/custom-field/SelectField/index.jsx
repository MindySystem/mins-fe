import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { HiCheck, HiSelector } from 'react-icons/hi';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function SelectField(props) {
    const {
        label,
        selected,
        className,
        options,
        onChange
    } = props;

  return (
    <Listbox value={selected ? selected : ''} onChange={onChange}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-lg" >{label}</Listbox.Label>
          <div className={`select-field ${className}`}>
            <Listbox.Button className="select-field-selected flex items-center">
              <img className="max-w-[5%] rounded-full" src={selected ? selected.img : '' } alt="" />
              <span className="inline-block">{selected && selected.label}</span>
              <span className="icon">
                <HiSelector className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="select-field-options">
                {options && options.map((person, index) => (
                  <Listbox.Option
                    key={`${person.value}${index}`}
                    className={({ active }) =>
                      classNames(
                        active ? 'text-white bg-indigo-600' : 'text-gray-900',
                        'cursor-default select-none relative py-2 pl-3 pr-9'
                      )
                    }
                    value={person}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block')}>
                          {person.label}
                        </span>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <HiCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}