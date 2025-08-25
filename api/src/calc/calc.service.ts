import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CalcService {
    constructor(private http: HttpService) { }

    // apps/api/src/calc/calc.service.ts
    async calcularHR(payload: any) {
        const body = typeof payload === 'string' ? JSON.parse(payload) : payload;
        const url = `${process.env.CALC_BASE_URL}/calc/hr`;
        try {
            const { data } = await firstValueFrom(
                this.http.post(url, body, {
                    timeout: 15000,
                    headers: { 'Content-Type': 'application/json' },
                })
            );
            return data;
        } catch (err: any) {
            console.error('Calc HR error:', {
                code: err?.code,
                message: err?.message,
                status: err?.response?.status,
                data: err?.response?.data
            });
            throw err;
        }
    }
}
