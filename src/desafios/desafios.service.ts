import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriasService } from 'src/categorias/categorias.service';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { DesafioStatus } from './interfaces/desafio-status.enum';
import { Desafio, Partida } from './interfaces/desafio.interface';

@Injectable()
export class DesafiosService {

     constructor(@InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
                 @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
                    private readonly categoriasService: CategoriasService,
                    private readonly jogadoresService: JogadoresService) {}

     private readonly logger = new Logger(DesafiosService.name);

     async criarDesafio(criarDesafioDto: CriarDesafioDto): Promise<Desafio> {
          
          //verificar se os jogadores informados estão cadastrados
          const jogadores = await this.jogadoresService.consultarTodosJogadores();

          criarDesafioDto.jogadores.map(jogadorDto => {
               const jogadorFilter = jogadores.filter(jogador => jogador._id == jogadorDto._id);

               if(jogadorFilter.length == 0){
                    throw new BadRequestException(`O id ${jogadorDto._id} não é um jogador.`);
               }
          })

          //verificar se o solicitante é um dos jogadores da partir
          const solicitanteEhJogadorDaPartida = await criarDesafioDto.jogadores.filter(jogador => jogador._id == criarDesafioDto.solicitante);

          this.logger.log(`solicitanteEhJogadorDaPartida: ${solicitanteEhJogadorDaPartida}`);

          if(solicitanteEhJogadorDaPartida.length == 0){
               throw new BadRequestException(`O solicitante deve ser um jogador da partida.`)
          }

          //verificar a categoria com base no ID do solicitante
          const categoriaJogador = await this.categoriasService.consultarCategoriaJogador(criarDesafioDto.solicitante._id);

          if(!categoriaJogador){
               throw new BadRequestException(`O solicitante precisa estar registrado em uma categoria.`)
          }

          const desafioCriado = new this.desafioModel(criarDesafioDto);
          desafioCriado.categoria = categoriaJogador;
          desafioCriado.dataHoraSolicitacao = new Date();

          //desafio é criado com o status "pendente"
          desafioCriado.status = DesafioStatus.pendente;
          this.logger.log(`desafioCriado: ${JSON.stringify(desafioCriado)}`);

          return await desafioCriado.save();
     }

     async consultarTodosDesafios(): Promise<Array<Desafio>> {

          return await this.desafioModel.find()
               .populate('solicitante').populate('jogadores').populate('partida').exec();
     }

     async consultarDesafiosJogador(_id: any): Promise<Array<Desafio>>{
          const jogadores = await this.jogadoresService.consultarTodosJogadores();
          const jogadorFilter = jogadores.filter(jogador => jogador._id == _id);

          if(jogadorFilter.length == 0){
               throw new BadRequestException(`O id ${_id} não é um jogador.`);
          }

          return await this.desafioModel.find().where('jogadores').in(_id)
               .populate('solicitante').populate('jogadores').populate('partida').exec();
     }

     async atualizarDesafio(_id: string, atualizarDesafioDto: AtualizarDesafioDto): Promise<void> {
          const desafioEncontrado = await this.desafioModel.findById(_id).exec();

          if(!desafioEncontrado){
               throw new NotFoundException(`Desafio ${_id} não encontrado.`);
          }

          if(atualizarDesafioDto.status){
               desafioEncontrado.dataHoraResposta = new Date();
          }

          desafioEncontrado.status = atualizarDesafioDto.status;
          desafioEncontrado.dataHoraDesafio = atualizarDesafioDto.dataHoraDesafio;

          await this.desafioModel.findOneAndUpdate({_id}, {$set: desafioEncontrado}).exec();
     }

     async atribuirDesafioPartida(_id: string, atribuirDesafioPartidaDto: AtribuirDesafioPartidaDto): Promise<void> {
          const desafioEncontrado = await this.desafioModel.findById(_id).exec();

          if(!desafioEncontrado) {
               throw new BadRequestException(`Desafio ${_id} não cadastrado.`)
          }

          //verificar se o jogador faz parte do desafio
          const jogadorFilter = desafioEncontrado.jogadores.filter(jogador => jogador._id == atribuirDesafioPartidaDto.vencedor)

          this.logger.log(`desafioEncontrado: ${desafioEncontrado}`);
          this.logger.log(`jogadorFilter: ${jogadorFilter}`);

          if(jogadorFilter.length == 0){
               throw new BadRequestException(`O jogador vencedor não faz parte do desafio.`);
          }

          //criar e persistir um objeto partida
          const partidaCriada = new this.partidaModel(atribuirDesafioPartidaDto);
          partidaCriada.categoria = desafioEncontrado.categoria;
          partidaCriada.jogadores = desafioEncontrado.jogadores;

          const resultado = await partidaCriada.save();

          //atualizar o desafio
          desafioEncontrado.status = DesafioStatus.realizado;
          desafioEncontrado.partida = resultado._id;

          try{
               await this.desafioModel.findOneAndUpdate({_id}, {$set: desafioEncontrado}).exec();
          } catch (error) {
               //caso a atualização do desafio falhe, a partida que havia sido gravada é excluída
               await this.partidaModel.deleteOne({_id: resultado._id}).exec();
               throw new InternalServerErrorException();
          }
     }

     async deletarDesafio(_id: string): Promise<void> {
          const desafioEncontrado = await this.desafioModel.findById(_id).exec();

          if(!desafioEncontrado){
               throw new BadRequestException(`Desafio ${_id} não cadastrado.`)
          }

          desafioEncontrado.status = DesafioStatus.cancelado;

          await this.desafioModel.findOneAndUpdate({_id}, {$set: desafioEncontrado}).exec();
     }
}