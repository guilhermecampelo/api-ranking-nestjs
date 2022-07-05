import { IsEmail, IsNotEmpty } from 'class-validator';

export class CriarJogadorDto {  
  @IsNotEmpty()
  readonly celular: string;
  
  @IsEmail()
  readonly email: string;
  
  @IsNotEmpty()
  readonly nome: string;
}