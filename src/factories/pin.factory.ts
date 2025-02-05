import { SetupPinUseCase } from "@/use-cases/auth/setup-pin"
import { makeUserRepository } from "./user.factory"
import { PinUseCase } from "@/use-cases/auth/pin"

export function makePinUseCase() {
  const userRepository = makeUserRepository()
  return new PinUseCase(userRepository)
}

export function makeSetupPinUseCase() {
  const userRepository = makeUserRepository()
  return new SetupPinUseCase(userRepository)
}
