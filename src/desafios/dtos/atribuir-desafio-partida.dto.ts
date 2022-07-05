import { IsNotEmpty } from "class-validator";
import { Resultado } from "../interfaces/desafio.interface";
import { Jogador } from "src/jogadores/interfaces/jogador.interface";

export class AtribuirDesafioPartidaDto {
     @IsNotEmpty()
     vencedor: Jogador;

     @IsNotEmpty()
     resultado: Array<Resultado>;
}