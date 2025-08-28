from django.core.management.base import BaseCommand
from bs4 import BeautifulSoup
import requests
import re
import datetime
from models import Monthlyindicatordata
import pandas as pd

class Command(BaseCommand):
    def handle(self):
        if self.is_4th_business_day():
            stored_data = Monthlyindicatordata.objects.get(id='lei_pmi')
            lei = stored_data.lei
            m_pmi = stored_data.manufacturingpmi
            s_pmi = stored_data.servicespmi


            month = datetime.date.today().strftime("%B")
            ism_pmi_response = requests.get(f'https://www.ismworld.org/supply-management-news-and-reports/reports/ism-report-on-business/services/{month}/')
            if ism_pmi_response.status_code==200:
                soup = BeautifulSoup(ism_pmi_response.text, 'html.parser')
                tds = soup.find_all('td')
                ism_manufacturing_pmi = tds[0].text
                ism_services_pmi = tds[6].text

                m_pmi.pop()
                m_pmi.append(ism_manufacturing_pmi)
                self.update_month_and_data(s_pmi, ism_services_pmi)
                s_pmi['data'].pop()
                s_pmi['data'].append(ism_services_pmi)
                updated_month = s_pmi['months'].pop()
                s_pmi['months'].append(updated_month)


            lei_response = requests.get('https://www.conference-board.org/topics/us-leading-indicators/')
            if  lei_response.status_code == 200:
                soup = BeautifulSoup(lei_response.text, 'html.parser')
                ps = soup.find_all('p')
                for p in ps:
                    match = re.search(r"\bto\s+(\d+\.\d+)", p.text)
                    if match:
                        lei_index = match.group(1)
                        self.update_month_and_data(lei, lei_index)
                        break
                    
            stored_data.save()

    def update_month_and_data(data, new_value):
            data['data'].pop()
            data['data'].append(new_value)
            updated_month = data['months'].pop()
            data['months'].append(updated_month)
    
    def is_4th_business_day(self):
        today = datetime.date.today()
        weekdays = pd.bdate_range(today.replace(day=1), today)
        return len(weekdays) == 4