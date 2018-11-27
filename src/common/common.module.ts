import { Module, Global } from '@nestjs/common';
import { DateScalar } from './scalars/date.scalar';

@Global()
@Module({ providers: [DateScalar], exports: [DateScalar] })
export class CommonModule {}
