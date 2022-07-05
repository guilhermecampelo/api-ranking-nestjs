import { IsNotEmpty } from 'class-validator';

export class AtualizarJogadorDto {  
  @IsNotEmpty()
  readonly celular: string;
  
  @IsNotEmpty()
  readonly nome: string;
}