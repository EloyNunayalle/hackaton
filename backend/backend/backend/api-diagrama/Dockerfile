FROM public.ecr.aws/lambda/python:3.10

# Instala Graphviz (incluye el binario dot)
RUN yum -y install graphviz

# Copia los requisitos
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copia el código del handler
COPY Diagrams.py ./

# Comando para Lambda
CMD ["Diagrams.lambda_handler"]