import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Categoria } from './interfaces/categoria.interface';
import { Model } from 'mongoose';
import { CriarCategoriaDto } from './dtos/criar-categoria.dto';
import { AtualizarCategoriaDto } from './dtos/atualizar-categoria.dto';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { Jogador } from 'src/jogadores/interfaces/jogador.interface';

@Injectable()
export class CategoriasService {
     constructor(@InjectModel('Categoria') private readonly categoriaModel: Model<Categoria>,
                    private readonly jogadoresService: JogadoresService) {}

     async criarCategoria(criarCategoriaDto: CriarCategoriaDto): Promise<Categoria> {
          const { categoria } = criarCategoriaDto;
          const categoriaEncontrada = await this.categoriaModel.findOne({categoria}).exec();

          if(categoriaEncontrada){
               throw new BadRequestException(`Categoria ${categoria} já cadastrada.`);
          }

          const categoriaCriada =  new this.categoriaModel(criarCategoriaDto);

          return await categoriaCriada.save();
     }

     async consultarTodasCategorias(): Promise<Array<Categoria>> {

          return await this.categoriaModel.find().populate('jogadores').exec();
     }

     async consultarCategoriaPorId(categoria: string): Promise<Categoria> {
          const categoriaEncontrada = await this.categoriaModel.findOne({categoria}).exec();

          if(!categoriaEncontrada){
               throw new NotFoundException(`Categoria ${categoria} não encontrada.`);
          }

          return categoriaEncontrada;
     }

     async atualizarCategoria(categoria: string, atualizarCategoriaDto: AtualizarCategoriaDto): Promise<void>{
          const categoriaEncontrada = await this.categoriaModel.findOne({categoria}).exec();

          if(!categoriaEncontrada){
               throw new NotFoundException(`Categoria ${categoria} não encontrada.`);
          }

          await this.categoriaModel.findOneAndUpdate({categoria}, {$set: atualizarCategoriaDto}).exec();
     }

     async atribuirCategoriaJogador(params: string[]): Promise<void> {
          const categoria = params['categoria'];
          const idJogador = params['idJogador'];
          
          const categoriaEncontrada = await this.categoriaModel.findOne({categoria}).exec();

          if(!categoriaEncontrada){
               throw new BadRequestException(`Categoria ${categoria} não encontrada.`);
          }

          await this.jogadoresService.consultarJogadorPorId(idJogador);

          const jogadorJaCadastradoCategoria = await this.categoriaModel.find({categoria}).where('jogadores').in(idJogador).exec()
          //vai na categoria informada, pega a estrutura/array jogadores e vê se tem o id informado

          if(jogadorJaCadastradoCategoria.length > 0){
               throw new BadRequestException(`Jogador ${idJogador} já cadastrado na Categoria ${categoria}.`)
          }

          categoriaEncontrada.jogadores.push(idJogador)

          await this.categoriaModel.findOneAndUpdate({categoria},{$set: categoriaEncontrada}).exec();
     }

     async consultarCategoriaJogador(jogador: Jogador): Promise<string>{

          await this.jogadoresService.consultarJogadorPorId(jogador._id);

          const buscarCategoriaJogador = await this.categoriaModel.findOne({jogador}).exec();

          if(!buscarCategoriaJogador){
               throw new BadRequestException(`O jogador ${jogador} não está registrado em nenhuma categoria.`);
          }

          return buscarCategoriaJogador.categoria;
     }
}
