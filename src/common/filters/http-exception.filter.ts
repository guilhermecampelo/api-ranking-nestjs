import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
     private readonly logger = new Logger(AllExceptionsFilter.name);

     catch(exception: unknown, host: ArgumentsHost) {
          const ctx = host.switchToHttp();
          const response = ctx.getResponse();
          const request = ctx.getRequest();

          const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
          
          const message = exception instanceof HttpException ? exception.getResponse() : exception;

          this.logger.error(`Http Status: ${status}, Error Message: ${JSON.stringify(message)}`);

          response.status(status).json({ timestamp: new Date().toISOString(), path: request.url, error: message});
     }
}

//ArgumentHost: fornece um método provider pra recuperar os argumentos que estão sendo passados por um handle
//entrega o contexto em si da requisição http  que está sendo realizada
//swithToHttp: entrega 2 métodos, getRequest e getResponse, que vão entregar o contexto que está sendo executado
//é uma forma de interagir, em tempo de execução, com a requisição que está sendo feita