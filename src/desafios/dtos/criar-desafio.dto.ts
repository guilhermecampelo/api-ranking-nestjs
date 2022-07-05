import { ArrayMinSize, ArrayMaxSize, IsArray, IsDateString, IsNotEmpty } from "class-validator";
import { Jogador } from "src/jogadores/interfaces/jogador.interface";

export class CriarDesafioDto {
     @IsDateString()
     dataHoraDesafio: Date;

     @IsNotEmpty()
     solicitante: Jogador;

     @IsArray()
     @ArrayMinSize(2)
     @ArrayMaxSize(2)
     jogadores: Array<Jogador>;
}