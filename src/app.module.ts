import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JogadoresModule } from './jogadores/jogadores.module';
import { CategoriasModule } from './categorias/categorias.module';
import { DesafiosModule } from './desafios/desafios.module';

@Module ({
  imports: [
    MongooseModule.forRoot('mongodb+srv://admin:Pp159753@cluster0.9nues.mongodb.net/smartranking?retryWrites=true&w=majority'), 
    JogadoresModule, CategoriasModule, DesafiosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}