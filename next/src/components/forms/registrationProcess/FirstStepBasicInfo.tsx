'use client';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import React from 'react'
import { DateOfBirthSelect } from '../DateOfBirthSelect'

export default function FirstStepBasicInfo() {
  return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
          <Input {...register("username")} placeholder="username" />
          {errors.username && (
              <p className="error-msg">{`${errors.username.message}`}</p>
          )}
          <Input {...register("email")} placeholder="email" />
          {errors.email && (
              <p className="error-msg">{`${errors.email.message}`}</p>
          )}

          <DateOfBirthSelect
              signUpRegister={register}
              signUpSetValues={setValue}
              errors={errors}
          />

          <Input {...register("password")} type="password" placeholder="password" />
          {errors.password && (
              <p className="error-msg">{`${errors.password.message}`}</p>
          )}
          <Input {...register("confirmPassword")} type="password" placeholder="confirm password" />
          {errors.confirmPassword && (
              <p className="error-msg">{`${errors.confirmPassword.message}`}</p>
          )}

          {isSubmitting
              ? <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing up
              </Button>
              : <Button className='bg-primary font-bold text-white-1'>Sign up</Button>
          }
      </form>
  )
}
