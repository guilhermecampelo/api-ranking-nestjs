import { BadRequestException, PipeTransform } from "@nestjs/common";
import { DesafioStatus } from "src/desafios/interfaces/desafio-status.enum";

export class DesafioStatusValidacaoPipe implements PipeTransform {
     readonly statusPermitidos = [ DesafioStatus.aceito, DesafioStatus.negado, DesafioStatus.cancelado ];

     transform(value: any) {
     
          if(!this.validarStatus(value)){
               throw new BadRequestException(`${value} é um status inválido.`);
          }
     
          return value;
    }

     private validarStatus(status: any){
          const idx = this.statusPermitidos.indexOf(status);

          return idx !== -1;
     }
}