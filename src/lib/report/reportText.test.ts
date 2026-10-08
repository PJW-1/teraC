import { describe, expect, it } from 'vitest';
import { REPORT_BOM, reportFileName, reportText } from './reportText';

const AT = '2026-10-08T03:00:00.000Z'; // 12:00 in Seoul

describe('reportText', () => {
  it('keeps the old format: header, CRLF, categories in blocks, only counted items', () => {
    const text = reportText({
      storeName: '테라커피',
      at: AT,
      timeZone: 'Asia/Seoul',
      lines: [
        { categoryName: '파우더', itemName: '말차', unit: '개', quantity: 1.5 },
        { categoryName: '파우더', itemName: '그린티', unit: '개', quantity: null },
        { categoryName: '베이커리', itemName: '크루아상', unit: '봉', quantity: 0 },
        { categoryName: '파우더', itemName: '바닐라', unit: '개', quantity: 2 },
      ],
    });
    expect(text).toBe(
      '[테라커피 재고조사 - 2026. 10. 8.]\r\n\r\n' +
        '말차: 1.5 개\r\n바닐라: 2 개\r\n\r\n' +
        '크루아상: 0 봉',
    );
  });

  it('orders categories by the given order when there is one', () => {
    const text = reportText({
      storeName: 'S',
      at: AT,
      timeZone: 'Asia/Seoul',
      categoryOrder: ['베이커리', '파우더'],
      lines: [
        { categoryName: '파우더', itemName: '말차', unit: '개', quantity: 1 },
        { categoryName: '베이커리', itemName: '빵', unit: '개', quantity: 2 },
      ],
    });
    expect(text.endsWith('빵: 2 개\r\n\r\n말차: 1 개')).toBe(true);
  });

  it('says so when nothing was counted', () => {
    expect(reportText({ storeName: 'S', at: AT, lines: [] })).toBe('조사된 재고가 없습니다.');
  });
});

describe('report file', () => {
  it('names the file by store and local date', () => {
    expect(reportFileName('테라커피', '2026-10-07T16:00:00.000Z', 'Asia/Seoul')).toBe('테라커피_재고조사_2026-10-08.txt');
  });

  it('falls back to the device zone for a time zone Intl rejects', () => {
    expect(reportFileName('테라커피', AT, 'Seoul')).toBe(reportFileName('테라커피', AT));
    const lines = [{ categoryName: '원두', itemName: '케냐', unit: '개', quantity: 1 }];
    expect(reportText({ storeName: '테라커피', at: AT, timeZone: 'Seoul', lines })).toBe(
      reportText({ storeName: '테라커피', at: AT, lines }),
    );
  });

  it('starts the file with a BOM for Windows Notepad', () => {
    expect(REPORT_BOM).toBe('﻿');
  });
});
