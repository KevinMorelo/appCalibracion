import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CalcService } from './calc.service';

@Module({
  imports: [HttpModule],
  providers: [CalcService],
  exports: [CalcService]
})
export class CalcModule {}
