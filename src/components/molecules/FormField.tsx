"use client"

import { useFormContext, RegisterOptions } from "react-hook-form"
import { Input, InputProps } from "@/components/atoms/Input"

interface FormFieldProps extends InputProps {
  name: string
  registerOptions?: RegisterOptions
}

export const FormField = ({ name, registerOptions, ...props }: FormFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]?.message as string

  return <Input {...register(name, registerOptions)} error={error} {...props} />
}
