--
-- PostgreSQL database dump
--

\restrict ymZalTx1jgSIlCx0UtyyMbBACvRsa6Zub1huwnpG27nbuJ6Y4J0nh6IbQuITB3c

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-08-31 22:19:59

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16734)
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- TOC entry 5432 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- TOC entry 3 (class 3079 OID 16913)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5433 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 345 (class 1255 OID 16854)
-- Name: fn_auditoria_categorias(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auditoria_categorias() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_usuario INT;
BEGIN
    v_id_usuario := NULLIF(current_setting('app.current_usuario_id', true), '')::INT;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, descripcion)
        VALUES (v_id_usuario, 'CREAR', 'categorias', NEW.id_categoria, 'Categoría creada: ' || NEW.nombre);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, descripcion)
        VALUES (v_id_usuario, 'EDITAR', 'categorias', NEW.id_categoria, 'Categoría editada: ' || NEW.nombre);
    END IF;
    RETURN NEW;
END;
$$;


--
-- TOC entry 346 (class 1255 OID 16856)
-- Name: fn_auditoria_compras(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auditoria_compras() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, descripcion)
    VALUES (
        NEW.id_usuario, 'VENTA', 'compras', NEW.id_compra,
        'Venta ' || NEW.numero_factura || ' registrada por un total de ' || NEW.total::TEXT
    );
    RETURN NEW;
END;
$$;


--
-- TOC entry 347 (class 1255 OID 16858)
-- Name: fn_auditoria_inventario(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auditoria_inventario() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.tipo_movimiento IN ('ENTRADA', 'AJUSTE') THEN
        INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, descripcion)
        VALUES (
            NEW.id_usuario, 'MOVIMIENTO_INVENTARIO', 'movimientos_inventario', NEW.id_movimiento,
            NEW.tipo_movimiento || ' de ' || NEW.cantidad::TEXT || ' unidades en producto ' ||
            NEW.id_producto::TEXT || COALESCE(' — motivo: ' || NEW.motivo, '')
        );
    END IF;
    RETURN NEW;
END;
$$;


--
-- TOC entry 343 (class 1255 OID 16850)
-- Name: fn_auditoria_productos(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auditoria_productos() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_usuario INT;
BEGIN
    v_id_usuario := NULLIF(current_setting('app.current_usuario_id', true), '')::INT;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, descripcion)
        VALUES (v_id_usuario, 'CREAR', 'productos', NEW.id_producto, 'Producto creado: ' || NEW.nombre);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.estado = TRUE AND NEW.estado = FALSE THEN
            INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, descripcion)
            VALUES (v_id_usuario, 'DESACTIVAR', 'productos', NEW.id_producto, 'Producto desactivado: ' || NEW.nombre);
        ELSE
            INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, descripcion)
            VALUES (v_id_usuario, 'EDITAR', 'productos', NEW.id_producto, 'Producto editado: ' || NEW.nombre);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


--
-- TOC entry 344 (class 1255 OID 16852)
-- Name: fn_auditoria_servicios(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auditoria_servicios() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_usuario INT;
BEGIN
    v_id_usuario := NULLIF(current_setting('app.current_usuario_id', true), '')::INT;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, descripcion)
        VALUES (v_id_usuario, 'CREAR', 'servicios', NEW.id_servicio, 'Servicio creado: ' || NEW.nombre);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.estado = TRUE AND NEW.estado = FALSE THEN
            INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, descripcion)
            VALUES (v_id_usuario, 'DESACTIVAR', 'servicios', NEW.id_servicio, 'Servicio desactivado: ' || NEW.nombre);
        ELSE
            INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, descripcion)
            VALUES (v_id_usuario, 'EDITAR', 'servicios', NEW.id_servicio, 'Servicio editado: ' || NEW.nombre);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


--
-- TOC entry 297 (class 1255 OID 16844)
-- Name: fn_calcular_itbms(numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_calcular_itbms(p_subtotal numeric) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_tasa NUMERIC;
BEGIN
    SELECT valor::NUMERIC INTO v_tasa
    FROM configuracion_sistema
    WHERE clave = 'ITBMS_PORCENTAJE';

    IF v_tasa IS NULL THEN
        v_tasa := 0.07;
    END IF;

    RETURN ROUND(p_subtotal * v_tasa, 2);
END;
$$;


--
-- TOC entry 5434 (class 0 OID 0)
-- Dependencies: 297
-- Name: FUNCTION fn_calcular_itbms(p_subtotal numeric); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.fn_calcular_itbms(p_subtotal numeric) IS 'Calcula el ITBMS (7% por defecto) a partir de la tasa configurada en configuracion_sistema';


--
-- TOC entry 298 (class 1255 OID 16846)
-- Name: fn_generar_numero_factura(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_generar_numero_factura() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN 'F-' || LPAD(nextval('seq_numero_factura')::TEXT, 6, '0');
END;
$$;


--
-- TOC entry 300 (class 1255 OID 16847)
-- Name: fn_registrar_movimiento_inventario(integer, character varying, integer, character varying, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_registrar_movimiento_inventario(p_id_producto integer, p_tipo_movimiento character varying, p_cantidad integer, p_motivo character varying, p_id_usuario integer, p_id_compra integer DEFAULT NULL::integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_stock_actual   INT;
    v_stock_nuevo    INT;
    v_delta          INT;
    v_id_movimiento  INT;
BEGIN
    IF p_tipo_movimiento NOT IN ('ENTRADA', 'SALIDA', 'AJUSTE') THEN
        RAISE EXCEPTION 'Tipo de movimiento inválido: %', p_tipo_movimiento;
    END IF;

    IF p_cantidad = 0 OR (p_tipo_movimiento IN ('ENTRADA','SALIDA') AND p_cantidad < 0) THEN
        RAISE EXCEPTION 'Cantidad inválida (%) para un movimiento de tipo %', p_cantidad, p_tipo_movimiento;
    END IF;

    -- Bloquea la fila para que dos ventas simultáneas no lean el mismo
    -- stock "viejo" y produzcan un stock negativo (condición de carrera).
    SELECT stock INTO v_stock_actual
    FROM productos
    WHERE id_producto = p_id_producto
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El producto % no existe', p_id_producto;
    END IF;

    IF p_tipo_movimiento = 'ENTRADA' THEN
        v_delta := ABS(p_cantidad);
    ELSIF p_tipo_movimiento = 'SALIDA' THEN
        v_delta := -ABS(p_cantidad);
    ELSE
        v_delta := p_cantidad; -- AJUSTE: signo explícito
    END IF;

    v_stock_nuevo := v_stock_actual + v_delta;

    IF v_stock_nuevo < 0 THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto %: disponible %, solicitado %',
            p_id_producto, v_stock_actual, ABS(v_delta);
    END IF;

    UPDATE productos SET stock = v_stock_nuevo WHERE id_producto = p_id_producto;

    INSERT INTO movimientos_inventario
        (id_producto, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, id_usuario, id_compra)
    VALUES
        (p_id_producto, p_tipo_movimiento, v_delta, v_stock_actual, v_stock_nuevo, p_motivo, p_id_usuario, p_id_compra)
    RETURNING id_movimiento INTO v_id_movimiento;

    RETURN v_id_movimiento;
END;
$$;


--
-- TOC entry 5435 (class 0 OID 0)
-- Dependencies: 300
-- Name: FUNCTION fn_registrar_movimiento_inventario(p_id_producto integer, p_tipo_movimiento character varying, p_cantidad integer, p_motivo character varying, p_id_usuario integer, p_id_compra integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.fn_registrar_movimiento_inventario(p_id_producto integer, p_tipo_movimiento character varying, p_cantidad integer, p_motivo character varying, p_id_usuario integer, p_id_compra integer) IS 'Punto único de actualización de stock: bloquea la fila, valida y registra el movimiento de forma atómica';


--
-- TOC entry 301 (class 1255 OID 16848)
-- Name: fn_registrar_venta(integer, integer, character varying, jsonb, jsonb, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_registrar_venta(p_id_cliente integer, p_id_usuario integer, p_metodo_pago character varying, p_productos jsonb, p_servicios jsonb, p_fecha timestamp without time zone DEFAULT NULL::timestamp without time zone) RETURNS TABLE(id_compra integer, numero_factura character varying, subtotal numeric, itbms numeric, total numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_compra        INT;
    v_numero_factura   VARCHAR;
    v_subtotal         NUMERIC := 0;
    v_itbms            NUMERIC;
    v_total            NUMERIC;
    v_item             RECORD;
    v_id_producto      INT;
    v_cantidad         INT;
    v_precio           NUMERIC;
    v_estado_activo    BOOLEAN;
    v_line_subtotal    NUMERIC;
    v_id_servicio      INT;
    v_id_mascota       INT;
    v_id_cliente_mascota INT;
    v_tiene_items      BOOLEAN := FALSE;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM clientes WHERE id_cliente = p_id_cliente AND estado = TRUE) THEN
        RAISE EXCEPTION 'El cliente % no existe o está inactivo (RN-07: toda venta requiere un cliente)', p_id_cliente;
    END IF;

    IF (p_productos IS NULL OR jsonb_array_length(p_productos) = 0)
       AND (p_servicios IS NULL OR jsonb_array_length(p_servicios) = 0) THEN
        RAISE EXCEPTION 'La venta debe incluir al menos un producto o un servicio';
    END IF;

    v_numero_factura := fn_generar_numero_factura();

    -- Cabecera provisional; subtotal/itbms/total se corrigen al final
    -- de la función una vez calculados (los CHECK se validan al COMMIT
    -- implícito de la sentencia, no antes).
    INSERT INTO compras (numero_factura, id_cliente, id_usuario, fecha, metodo_pago, subtotal, itbms, total, estado)
    VALUES (v_numero_factura, p_id_cliente, p_id_usuario, COALESCE(p_fecha, now()), COALESCE(p_metodo_pago, 'EFECTIVO'), 0, 0, 0, 'COMPLETADA')
    RETURNING compras.id_compra INTO v_id_compra;

    -- ---------------- Detalle de productos ----------------
    IF p_productos IS NOT NULL THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_productos) AS t(item) LOOP
            v_id_producto := (v_item.item ->> 'id_producto')::INT;
            v_cantidad    := (v_item.item ->> 'cantidad')::INT;

            IF v_cantidad IS NULL OR v_cantidad <= 0 THEN
                RAISE EXCEPTION 'Cantidad inválida para el producto %', v_id_producto;
            END IF;

            SELECT precio, estado INTO v_precio, v_estado_activo
            FROM productos WHERE id_producto = v_id_producto
            FOR UPDATE;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'El producto % no existe', v_id_producto;
            END IF;
            IF NOT v_estado_activo THEN
                RAISE EXCEPTION 'El producto % está inactivo y no puede venderse (RN-03)', v_id_producto;
            END IF;

            v_line_subtotal := v_precio * v_cantidad;
            v_subtotal := v_subtotal + v_line_subtotal;
            v_tiene_items := TRUE;

            INSERT INTO compra_producto (id_compra, id_producto, cantidad, precio_unitario, subtotal)
            VALUES (v_id_compra, v_id_producto, v_cantidad, v_precio, v_line_subtotal);

            -- Descuenta stock y deja trazabilidad; lanza excepción y
            -- revierte toda la venta si no hay stock suficiente (RN-06).
            PERFORM fn_registrar_movimiento_inventario(
                v_id_producto, 'SALIDA', v_cantidad,
                'Venta ' || v_numero_factura, p_id_usuario, v_id_compra
            );
        END LOOP;
    END IF;

    -- ---------------- Detalle de servicios ----------------
    IF p_servicios IS NOT NULL THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_servicios) AS t(item) LOOP
            v_id_servicio := (v_item.item ->> 'id_servicio')::INT;
            v_id_mascota  := (v_item.item ->> 'id_mascota')::INT;

            IF v_id_mascota IS NULL THEN
                RAISE EXCEPTION 'Todo servicio requiere una mascota seleccionada (RN-08)';
            END IF;

            SELECT precio, estado INTO v_precio, v_estado_activo
            FROM servicios WHERE id_servicio = v_id_servicio;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'El servicio % no existe', v_id_servicio;
            END IF;
            IF NOT v_estado_activo THEN
                RAISE EXCEPTION 'El servicio % está inactivo y no puede agregarse a una venta (RN-03)', v_id_servicio;
            END IF;

            SELECT id_cliente INTO v_id_cliente_mascota
            FROM mascotas WHERE id_mascota = v_id_mascota AND estado = TRUE;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'La mascota % no existe o está inactiva', v_id_mascota;
            END IF;
            IF v_id_cliente_mascota <> p_id_cliente THEN
                RAISE EXCEPTION 'La mascota % no pertenece al cliente % seleccionado en esta venta', v_id_mascota, p_id_cliente;
            END IF;

            v_line_subtotal := v_precio;
            v_subtotal := v_subtotal + v_line_subtotal;
            v_tiene_items := TRUE;

            INSERT INTO compra_servicio (id_compra, id_servicio, id_mascota, precio_unitario, subtotal)
            VALUES (v_id_compra, v_id_servicio, v_id_mascota, v_precio, v_line_subtotal);
        END LOOP;
    END IF;

    IF NOT v_tiene_items THEN
        RAISE EXCEPTION 'La venta debe incluir al menos un producto o un servicio';
    END IF;

    v_itbms := fn_calcular_itbms(v_subtotal);
    v_total := v_subtotal + v_itbms;

    UPDATE compras
    SET subtotal = v_subtotal, itbms = v_itbms, total = v_total
    WHERE compras.id_compra = v_id_compra;

    RETURN QUERY
    SELECT v_id_compra, v_numero_factura, v_subtotal, v_itbms, v_total;
END;
$$;


--
-- TOC entry 5436 (class 0 OID 0)
-- Dependencies: 301
-- Name: FUNCTION fn_registrar_venta(p_id_cliente integer, p_id_usuario integer, p_metodo_pago character varying, p_productos jsonb, p_servicios jsonb, p_fecha timestamp without time zone); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.fn_registrar_venta(p_id_cliente integer, p_id_usuario integer, p_metodo_pago character varying, p_productos jsonb, p_servicios jsonb, p_fecha timestamp without time zone) IS 'Registra una venta completa (productos y/o servicios) de forma atómica: valida, calcula ITBMS y descuenta stock. Ante cualquier error, PostgreSQL revierte todos los cambios.';


--
-- TOC entry 348 (class 1255 OID 16860)
-- Name: fn_validar_stock_compra_producto(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_validar_stock_compra_producto() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_stock  INT;
    v_activo BOOLEAN;
BEGIN
    SELECT stock, estado INTO v_stock, v_activo
    FROM productos WHERE id_producto = NEW.id_producto;

    IF NOT v_activo THEN
        RAISE EXCEPTION 'El producto % está inactivo y no puede venderse', NEW.id_producto;
    END IF;

    IF NEW.cantidad > v_stock THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto % (disponible %, solicitado %)',
            NEW.id_producto, v_stock, NEW.cantidad;
    END IF;

    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 248 (class 1259 OID 16585)
-- Name: auditoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditoria (
    id_auditoria bigint NOT NULL,
    id_usuario integer,
    accion character varying(30) NOT NULL,
    tabla_afectada character varying(60) NOT NULL,
    id_registro_afectado integer,
    descripcion character varying(300),
    fecha_hora timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 5437 (class 0 OID 0)
-- Dependencies: 248
-- Name: TABLE auditoria; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.auditoria IS 'Registro de acciones administrativas relevantes del sistema';


--
-- TOC entry 247 (class 1259 OID 16584)
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auditoria_id_auditoria_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5438 (class 0 OID 0)
-- Dependencies: 247
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auditoria_id_auditoria_seq OWNED BY public.auditoria.id_auditoria;


--
-- TOC entry 230 (class 1259 OID 16457)
-- Name: categorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categorias (
    id_categoria integer NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(200),
    estado boolean DEFAULT true NOT NULL
);


--
-- TOC entry 5439 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE categorias; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.categorias IS 'Clasificación de productos (Alimentos, Juguetes, Higiene, etc.)';


--
-- TOC entry 229 (class 1259 OID 16456)
-- Name: categorias_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categorias_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5440 (class 0 OID 0)
-- Dependencies: 229
-- Name: categorias_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categorias_id_categoria_seq OWNED BY public.categorias.id_categoria;


--
-- TOC entry 226 (class 1259 OID 16430)
-- Name: clientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clientes (
    id_cliente integer NOT NULL,
    nombre character varying(60) NOT NULL,
    apellido character varying(60) NOT NULL,
    telefono character varying(20),
    email character varying(120),
    direccion character varying(200),
    estado boolean DEFAULT true NOT NULL,
    fecha_registro timestamp without time zone DEFAULT now() NOT NULL,
    cedula character varying(20),
    CONSTRAINT ck_clientes_email CHECK (((email IS NULL) OR ((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)))
);


--
-- TOC entry 5441 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE clientes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.clientes IS 'Personas que compran productos o servicios en MELO Pets';


--
-- TOC entry 5442 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN clientes.cedula; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.clientes.cedula IS 'Cédula o DNI del cliente. Nula para clientes ya existentes; obligatoria para clientes nuevos (regla aplicada en el backend, no en la base).';


--
-- TOC entry 225 (class 1259 OID 16429)
-- Name: clientes_id_cliente_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clientes_id_cliente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5443 (class 0 OID 0)
-- Dependencies: 225
-- Name: clientes_id_cliente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clientes_id_cliente_seq OWNED BY public.clientes.id_cliente;


--
-- TOC entry 244 (class 1259 OID 16559)
-- Name: compra_producto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compra_producto (
    id_detalle integer NOT NULL,
    id_compra integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    CONSTRAINT ck_compra_producto_cantidad CHECK ((cantidad > 0)),
    CONSTRAINT ck_compra_producto_precio CHECK ((precio_unitario > (0)::numeric)),
    CONSTRAINT ck_compra_producto_subtotal CHECK ((subtotal >= (0)::numeric))
);


--
-- TOC entry 5444 (class 0 OID 0)
-- Dependencies: 244
-- Name: TABLE compra_producto; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.compra_producto IS 'Detalle de productos vendidos en una compra';


--
-- TOC entry 243 (class 1259 OID 16558)
-- Name: compra_producto_id_detalle_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.compra_producto_id_detalle_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5445 (class 0 OID 0)
-- Dependencies: 243
-- Name: compra_producto_id_detalle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.compra_producto_id_detalle_seq OWNED BY public.compra_producto.id_detalle;


--
-- TOC entry 246 (class 1259 OID 16572)
-- Name: compra_servicio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compra_servicio (
    id_detalle integer NOT NULL,
    id_compra integer NOT NULL,
    id_servicio integer NOT NULL,
    id_mascota integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    CONSTRAINT ck_compra_servicio_precio CHECK ((precio_unitario > (0)::numeric)),
    CONSTRAINT ck_compra_servicio_subtotal CHECK ((subtotal >= (0)::numeric))
);


--
-- TOC entry 5446 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE compra_servicio; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.compra_servicio IS 'Detalle de servicios prestados en una compra, con la mascota atendida';


--
-- TOC entry 245 (class 1259 OID 16571)
-- Name: compra_servicio_id_detalle_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.compra_servicio_id_detalle_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5447 (class 0 OID 0)
-- Dependencies: 245
-- Name: compra_servicio_id_detalle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.compra_servicio_id_detalle_seq OWNED BY public.compra_servicio.id_detalle;


--
-- TOC entry 242 (class 1259 OID 16539)
-- Name: compras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compras (
    id_compra integer NOT NULL,
    numero_factura character varying(20) NOT NULL,
    id_cliente integer NOT NULL,
    id_usuario integer NOT NULL,
    fecha timestamp without time zone DEFAULT now() NOT NULL,
    metodo_pago character varying(20) DEFAULT 'EFECTIVO'::character varying NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    itbms numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    estado character varying(15) DEFAULT 'COMPLETADA'::character varying NOT NULL,
    CONSTRAINT ck_compras_estado CHECK (((estado)::text = ANY ((ARRAY['COMPLETADA'::character varying, 'ANULADA'::character varying])::text[]))),
    CONSTRAINT ck_compras_itbms CHECK ((itbms >= (0)::numeric)),
    CONSTRAINT ck_compras_metodo_pago CHECK (((metodo_pago)::text = ANY ((ARRAY['EFECTIVO'::character varying, 'TARJETA'::character varying, 'TRANSFERENCIA'::character varying])::text[]))),
    CONSTRAINT ck_compras_subtotal CHECK ((subtotal >= (0)::numeric)),
    CONSTRAINT ck_compras_total CHECK ((total >= (0)::numeric)),
    CONSTRAINT ck_compras_total_coherente CHECK ((abs((total - (subtotal + itbms))) < 0.01))
);


--
-- TOC entry 5448 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE compras; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.compras IS 'Cabecera de cada venta (caja)';


--
-- TOC entry 241 (class 1259 OID 16538)
-- Name: compras_id_compra_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.compras_id_compra_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5449 (class 0 OID 0)
-- Dependencies: 241
-- Name: compras_id_compra_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.compras_id_compra_seq OWNED BY public.compras.id_compra;


--
-- TOC entry 240 (class 1259 OID 16529)
-- Name: configuracion_sistema; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion_sistema (
    id_config integer NOT NULL,
    clave character varying(60) NOT NULL,
    valor character varying(100) NOT NULL,
    descripcion character varying(200)
);


--
-- TOC entry 5450 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE configuracion_sistema; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.configuracion_sistema IS 'Parámetros del sistema, p. ej. tasa de ITBMS, sin hardcodear en el código';


--
-- TOC entry 239 (class 1259 OID 16528)
-- Name: configuracion_sistema_id_config_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.configuracion_sistema_id_config_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5451 (class 0 OID 0)
-- Dependencies: 239
-- Name: configuracion_sistema_id_config_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.configuracion_sistema_id_config_seq OWNED BY public.configuracion_sistema.id_config;


--
-- TOC entry 228 (class 1259 OID 16444)
-- Name: mascotas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mascotas (
    id_mascota integer NOT NULL,
    id_cliente integer NOT NULL,
    nombre character varying(60) NOT NULL,
    especie character varying(30) NOT NULL,
    raza character varying(60),
    sexo character(1),
    fecha_nacimiento date,
    peso numeric(5,2),
    observaciones character varying(300),
    estado boolean DEFAULT true NOT NULL,
    CONSTRAINT ck_mascotas_fecha_nacimiento CHECK (((fecha_nacimiento IS NULL) OR (fecha_nacimiento <= CURRENT_DATE))),
    CONSTRAINT ck_mascotas_peso CHECK (((peso IS NULL) OR (peso > (0)::numeric))),
    CONSTRAINT ck_mascotas_sexo CHECK (((sexo IS NULL) OR (sexo = ANY (ARRAY['M'::bpchar, 'H'::bpchar]))))
);


--
-- TOC entry 5452 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE mascotas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mascotas IS 'Mascotas asociadas a un cliente';


--
-- TOC entry 227 (class 1259 OID 16443)
-- Name: mascotas_id_mascota_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mascotas_id_mascota_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5453 (class 0 OID 0)
-- Dependencies: 227
-- Name: mascotas_id_mascota_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mascotas_id_mascota_seq OWNED BY public.mascotas.id_mascota;


--
-- TOC entry 234 (class 1259 OID 16487)
-- Name: movimientos_inventario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movimientos_inventario (
    id_movimiento integer NOT NULL,
    id_producto integer NOT NULL,
    tipo_movimiento character varying(10) NOT NULL,
    cantidad integer NOT NULL,
    stock_anterior integer NOT NULL,
    stock_nuevo integer NOT NULL,
    motivo character varying(200),
    id_usuario integer NOT NULL,
    id_compra integer,
    fecha timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_movimientos_cantidad CHECK ((cantidad <> 0)),
    CONSTRAINT ck_movimientos_stock_anterior CHECK ((stock_anterior >= 0)),
    CONSTRAINT ck_movimientos_stock_nuevo CHECK ((stock_nuevo >= 0)),
    CONSTRAINT ck_movimientos_tipo CHECK (((tipo_movimiento)::text = ANY ((ARRAY['ENTRADA'::character varying, 'SALIDA'::character varying, 'AJUSTE'::character varying])::text[])))
);


--
-- TOC entry 5454 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE movimientos_inventario; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.movimientos_inventario IS 'Trazabilidad de entradas, salidas y ajustes de stock';


--
-- TOC entry 233 (class 1259 OID 16486)
-- Name: movimientos_inventario_id_movimiento_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.movimientos_inventario_id_movimiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5455 (class 0 OID 0)
-- Dependencies: 233
-- Name: movimientos_inventario_id_movimiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.movimientos_inventario_id_movimiento_seq OWNED BY public.movimientos_inventario.id_movimiento;


--
-- TOC entry 232 (class 1259 OID 16468)
-- Name: productos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.productos (
    id_producto integer NOT NULL,
    id_categoria integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(300),
    precio numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    stock_minimo integer DEFAULT 5 NOT NULL,
    estado boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_productos_precio CHECK ((precio > (0)::numeric)),
    CONSTRAINT ck_productos_stock CHECK ((stock >= 0)),
    CONSTRAINT ck_productos_stock_minimo CHECK ((stock_minimo >= 0))
);


--
-- TOC entry 5456 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE productos; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.productos IS 'Catálogo de productos en venta';


--
-- TOC entry 231 (class 1259 OID 16467)
-- Name: productos_id_producto_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.productos_id_producto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5457 (class 0 OID 0)
-- Dependencies: 231
-- Name: productos_id_producto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.productos_id_producto_seq OWNED BY public.productos.id_producto;


--
-- TOC entry 222 (class 1259 OID 16397)
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre_rol character varying(20) NOT NULL,
    descripcion character varying(100),
    CONSTRAINT ck_roles_nombre CHECK (((nombre_rol)::text = ANY ((ARRAY['CAJERO'::character varying, 'GERENTE'::character varying])::text[])))
);


--
-- TOC entry 5458 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE roles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.roles IS 'Catálogo de roles del sistema (CAJERO, GERENTE)';


--
-- TOC entry 221 (class 1259 OID 16396)
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5459 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_rol_seq OWNED BY public.roles.id_rol;


--
-- TOC entry 251 (class 1259 OID 16845)
-- Name: seq_numero_factura; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_numero_factura
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 238 (class 1259 OID 16514)
-- Name: servicios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.servicios (
    id_servicio integer NOT NULL,
    id_tipo_servicio integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(300),
    precio numeric(10,2) NOT NULL,
    duracion_estimada integer,
    estado boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_servicios_duracion CHECK (((duracion_estimada IS NULL) OR (duracion_estimada > 0))),
    CONSTRAINT ck_servicios_precio CHECK ((precio > (0)::numeric))
);


--
-- TOC entry 5460 (class 0 OID 0)
-- Dependencies: 238
-- Name: TABLE servicios; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.servicios IS 'Catálogo de servicios ofrecidos para mascotas';


--
-- TOC entry 237 (class 1259 OID 16513)
-- Name: servicios_id_servicio_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.servicios_id_servicio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5461 (class 0 OID 0)
-- Dependencies: 237
-- Name: servicios_id_servicio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.servicios_id_servicio_seq OWNED BY public.servicios.id_servicio;


--
-- TOC entry 250 (class 1259 OID 16597)
-- Name: sesiones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sesiones (
    id_sesion integer NOT NULL,
    id_usuario integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_expiracion timestamp without time zone NOT NULL,
    revocado boolean DEFAULT false NOT NULL
);


--
-- TOC entry 5462 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE sesiones; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.sesiones IS 'Tokens de sesión activos, permite cierre de sesión real y expiración';


--
-- TOC entry 249 (class 1259 OID 16596)
-- Name: sesiones_id_sesion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sesiones_id_sesion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5463 (class 0 OID 0)
-- Dependencies: 249
-- Name: sesiones_id_sesion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sesiones_id_sesion_seq OWNED BY public.sesiones.id_sesion;


--
-- TOC entry 236 (class 1259 OID 16503)
-- Name: tipos_servicio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipos_servicio (
    id_tipo_servicio integer NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(200),
    estado boolean DEFAULT true NOT NULL
);


--
-- TOC entry 5464 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE tipos_servicio; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tipos_servicio IS 'Clasificación de servicios (Baño, Corte, Salud, etc.)';


--
-- TOC entry 235 (class 1259 OID 16502)
-- Name: tipos_servicio_id_tipo_servicio_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipos_servicio_id_tipo_servicio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5465 (class 0 OID 0)
-- Dependencies: 235
-- Name: tipos_servicio_id_tipo_servicio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipos_servicio_id_tipo_servicio_seq OWNED BY public.tipos_servicio.id_tipo_servicio;


--
-- TOC entry 224 (class 1259 OID 16406)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    nombre character varying(60) NOT NULL,
    apellido character varying(60) NOT NULL,
    email character varying(120) NOT NULL,
    username character varying(40) NOT NULL,
    password_hash character varying(255) NOT NULL,
    id_rol integer NOT NULL,
    estado boolean DEFAULT true NOT NULL,
    intentos_fallidos smallint DEFAULT 0 NOT NULL,
    debe_cambiar_password boolean DEFAULT false NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    ultimo_login timestamp without time zone,
    bloqueado_hasta timestamp without time zone,
    CONSTRAINT ck_usuarios_email CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT ck_usuarios_intentos CHECK ((intentos_fallidos >= 0))
);


--
-- TOC entry 5466 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE usuarios; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.usuarios IS 'Cuentas del personal que opera el sistema (cajeros y gerentes)';


--
-- TOC entry 5467 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN usuarios.bloqueado_hasta; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.usuarios.bloqueado_hasta IS 'Si no es NULL y es mayor a now(), el login se rechaza aunque la contraseña sea correcta (bloqueo temporal por intentos fallidos)';


--
-- TOC entry 223 (class 1259 OID 16405)
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5468 (class 0 OID 0)
-- Dependencies: 223
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- TOC entry 261 (class 1259 OID 16903)
-- Name: vw_clientes_mascotas; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_clientes_mascotas AS
 SELECT cl.id_cliente,
    (((cl.nombre)::text || ' '::text) || (cl.apellido)::text) AS cliente,
    m.id_mascota,
    m.nombre AS mascota,
    m.especie,
    m.raza
   FROM (public.clientes cl
     JOIN public.mascotas m ON ((m.id_cliente = cl.id_cliente)))
  WHERE ((cl.estado = true) AND (m.estado = true))
  ORDER BY cl.nombre, cl.apellido;


--
-- TOC entry 262 (class 1259 OID 16908)
-- Name: vw_clientes_top_compradores; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_clientes_top_compradores AS
 SELECT cl.id_cliente,
    (((cl.nombre)::text || ' '::text) || (cl.apellido)::text) AS cliente,
    (count(c.id_compra))::integer AS cantidad_compras,
    sum(c.total) AS total_comprado
   FROM (public.compras c
     JOIN public.clientes cl ON ((cl.id_cliente = c.id_cliente)))
  WHERE ((c.estado)::text = 'COMPLETADA'::text)
  GROUP BY cl.id_cliente, cl.nombre, cl.apellido
  ORDER BY ((count(c.id_compra))::integer) DESC;


--
-- TOC entry 259 (class 1259 OID 16893)
-- Name: vw_historial_compras; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_historial_compras AS
 SELECT c.id_compra,
    c.numero_factura,
    c.fecha,
    cl.id_cliente,
    (((cl.nombre)::text || ' '::text) || (cl.apellido)::text) AS cliente,
    u.id_usuario,
    (((u.nombre)::text || ' '::text) || (u.apellido)::text) AS cajero,
    c.metodo_pago,
    c.subtotal,
    c.itbms,
    c.total,
    c.estado
   FROM ((public.compras c
     JOIN public.clientes cl ON ((cl.id_cliente = c.id_cliente)))
     JOIN public.usuarios u ON ((u.id_usuario = c.id_usuario)))
  ORDER BY c.fecha DESC;


--
-- TOC entry 260 (class 1259 OID 16898)
-- Name: vw_historial_servicios; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_historial_servicios AS
 SELECT cs.id_detalle,
    m.id_mascota,
    m.nombre AS mascota,
    cl.id_cliente,
    (((cl.nombre)::text || ' '::text) || (cl.apellido)::text) AS cliente,
    s.id_servicio,
    s.nombre AS servicio,
    c.fecha,
    cs.precio_unitario,
    (((u.nombre)::text || ' '::text) || (u.apellido)::text) AS usuario_registro
   FROM (((((public.compra_servicio cs
     JOIN public.compras c ON ((c.id_compra = cs.id_compra)))
     JOIN public.mascotas m ON ((m.id_mascota = cs.id_mascota)))
     JOIN public.clientes cl ON ((cl.id_cliente = m.id_cliente)))
     JOIN public.servicios s ON ((s.id_servicio = cs.id_servicio)))
     JOIN public.usuarios u ON ((u.id_usuario = c.id_usuario)))
  ORDER BY c.fecha DESC;


--
-- TOC entry 256 (class 1259 OID 16880)
-- Name: vw_inventario_bajo; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_inventario_bajo AS
 SELECT id_producto,
    nombre AS producto,
    stock,
    stock_minimo,
    (stock_minimo - stock) AS diferencia
   FROM public.productos p
  WHERE ((estado = true) AND (stock > 0) AND (stock < stock_minimo))
  ORDER BY (stock_minimo - stock) DESC;


--
-- TOC entry 257 (class 1259 OID 16884)
-- Name: vw_productos_agotados; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_productos_agotados AS
 SELECT id_producto,
    nombre AS producto,
    stock_minimo
   FROM public.productos p
  WHERE ((estado = true) AND (stock = 0));


--
-- TOC entry 263 (class 1259 OID 16951)
-- Name: vw_productos_inactivos; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_productos_inactivos AS
 SELECT p.id_producto,
    p.nombre AS producto,
    c.nombre AS categoria,
    p.stock
   FROM (public.productos p
     JOIN public.categorias c ON ((c.id_categoria = p.id_categoria)))
  WHERE (p.estado = false)
  ORDER BY p.nombre;


--
-- TOC entry 255 (class 1259 OID 16875)
-- Name: vw_productos_mas_vendidos; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_productos_mas_vendidos AS
 SELECT p.id_producto,
    p.nombre AS producto,
    (sum(cp.cantidad))::integer AS cantidad_vendida,
    sum(cp.subtotal) AS ingresos_generados
   FROM ((public.compra_producto cp
     JOIN public.productos p ON ((p.id_producto = cp.id_producto)))
     JOIN public.compras c ON ((c.id_compra = cp.id_compra)))
  WHERE ((c.estado)::text = 'COMPLETADA'::text)
  GROUP BY p.id_producto, p.nombre
  ORDER BY ((sum(cp.cantidad))::integer) DESC;


--
-- TOC entry 264 (class 1259 OID 16955)
-- Name: vw_servicios_inactivos; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_servicios_inactivos AS
 SELECT s.id_servicio,
    s.nombre AS servicio,
    ts.nombre AS tipo_servicio
   FROM (public.servicios s
     JOIN public.tipos_servicio ts ON ((ts.id_tipo_servicio = s.id_tipo_servicio)))
  WHERE (s.estado = false)
  ORDER BY s.nombre;


--
-- TOC entry 258 (class 1259 OID 16888)
-- Name: vw_servicios_mas_realizados; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_servicios_mas_realizados AS
 SELECT s.id_servicio,
    s.nombre AS servicio,
    (count(*))::integer AS cantidad_realizados,
    sum(cs.subtotal) AS ingresos_generados
   FROM ((public.compra_servicio cs
     JOIN public.servicios s ON ((s.id_servicio = cs.id_servicio)))
     JOIN public.compras c ON ((c.id_compra = cs.id_compra)))
  WHERE ((c.estado)::text = 'COMPLETADA'::text)
  GROUP BY s.id_servicio, s.nombre
  ORDER BY ((count(*))::integer) DESC;


--
-- TOC entry 253 (class 1259 OID 16866)
-- Name: vw_ventas_diarias; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_ventas_diarias AS
 SELECT (fecha)::date AS dia,
    (count(*))::integer AS cantidad_ventas,
    sum(subtotal) AS subtotal,
    sum(itbms) AS itbms,
    sum(total) AS total_vendido
   FROM public.compras
  WHERE ((estado)::text = 'COMPLETADA'::text)
  GROUP BY ((fecha)::date)
  ORDER BY ((fecha)::date) DESC;


--
-- TOC entry 254 (class 1259 OID 16870)
-- Name: vw_ventas_mensuales; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_ventas_mensuales AS
 SELECT (EXTRACT(year FROM fecha))::integer AS anio,
    (EXTRACT(month FROM fecha))::integer AS mes,
    (count(*))::integer AS cantidad_ventas,
    sum(subtotal) AS subtotal,
    sum(itbms) AS itbms,
    sum(total) AS total_vendido
   FROM public.compras
  WHERE ((estado)::text = 'COMPLETADA'::text)
  GROUP BY (EXTRACT(year FROM fecha)), (EXTRACT(month FROM fecha))
  ORDER BY ((EXTRACT(year FROM fecha))::integer) DESC, ((EXTRACT(month FROM fecha))::integer) DESC;


--
-- TOC entry 252 (class 1259 OID 16862)
-- Name: vw_ventas_totales; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_ventas_totales AS
 SELECT (count(*))::integer AS cantidad_ventas,
    COALESCE(sum(subtotal), (0)::numeric) AS subtotal,
    COALESCE(sum(itbms), (0)::numeric) AS itbms,
    COALESCE(sum(total), (0)::numeric) AS total_vendido
   FROM public.compras
  WHERE ((estado)::text = 'COMPLETADA'::text);


--
-- TOC entry 5107 (class 2604 OID 16588)
-- Name: auditoria id_auditoria; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria ALTER COLUMN id_auditoria SET DEFAULT nextval('public.auditoria_id_auditoria_seq'::regclass);


--
-- TOC entry 5086 (class 2604 OID 16460)
-- Name: categorias id_categoria; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id_categoria SET DEFAULT nextval('public.categorias_id_categoria_seq'::regclass);


--
-- TOC entry 5081 (class 2604 OID 16433)
-- Name: clientes id_cliente; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id_cliente SET DEFAULT nextval('public.clientes_id_cliente_seq'::regclass);


--
-- TOC entry 5105 (class 2604 OID 16562)
-- Name: compra_producto id_detalle; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compra_producto ALTER COLUMN id_detalle SET DEFAULT nextval('public.compra_producto_id_detalle_seq'::regclass);


--
-- TOC entry 5106 (class 2604 OID 16575)
-- Name: compra_servicio id_detalle; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compra_servicio ALTER COLUMN id_detalle SET DEFAULT nextval('public.compra_servicio_id_detalle_seq'::regclass);


--
-- TOC entry 5101 (class 2604 OID 16542)
-- Name: compras id_compra; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras ALTER COLUMN id_compra SET DEFAULT nextval('public.compras_id_compra_seq'::regclass);


--
-- TOC entry 5100 (class 2604 OID 16532)
-- Name: configuracion_sistema id_config; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_sistema ALTER COLUMN id_config SET DEFAULT nextval('public.configuracion_sistema_id_config_seq'::regclass);


--
-- TOC entry 5084 (class 2604 OID 16447)
-- Name: mascotas id_mascota; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mascotas ALTER COLUMN id_mascota SET DEFAULT nextval('public.mascotas_id_mascota_seq'::regclass);


--
-- TOC entry 5093 (class 2604 OID 16490)
-- Name: movimientos_inventario id_movimiento; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_inventario ALTER COLUMN id_movimiento SET DEFAULT nextval('public.movimientos_inventario_id_movimiento_seq'::regclass);


--
-- TOC entry 5088 (class 2604 OID 16471)
-- Name: productos id_producto; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos ALTER COLUMN id_producto SET DEFAULT nextval('public.productos_id_producto_seq'::regclass);


--
-- TOC entry 5075 (class 2604 OID 16400)
-- Name: roles id_rol; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_id_rol_seq'::regclass);


--
-- TOC entry 5097 (class 2604 OID 16517)
-- Name: servicios id_servicio; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.servicios ALTER COLUMN id_servicio SET DEFAULT nextval('public.servicios_id_servicio_seq'::regclass);


--
-- TOC entry 5109 (class 2604 OID 16600)
-- Name: sesiones id_sesion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones ALTER COLUMN id_sesion SET DEFAULT nextval('public.sesiones_id_sesion_seq'::regclass);


--
-- TOC entry 5095 (class 2604 OID 16506)
-- Name: tipos_servicio id_tipo_servicio; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_servicio ALTER COLUMN id_tipo_servicio SET DEFAULT nextval('public.tipos_servicio_id_tipo_servicio_seq'::regclass);


--
-- TOC entry 5076 (class 2604 OID 16409)
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- TOC entry 5423 (class 0 OID 16585)
-- Dependencies: 248
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auditoria (id_auditoria, id_usuario, accion, tabla_afectada, id_registro_afectado, descripcion, fecha_hora) FROM stdin;
1	1	CREAR	categorias	1	Categoría creada: Alimentos	2026-08-27 21:04:17.441095
2	1	CREAR	categorias	2	Categoría creada: Juguetes	2026-08-27 21:04:17.441095
3	1	CREAR	categorias	3	Categoría creada: Higiene	2026-08-27 21:04:17.441095
4	1	CREAR	categorias	4	Categoría creada: Accesorios	2026-08-27 21:04:17.441095
5	1	CREAR	categorias	5	Categoría creada: Salud	2026-08-27 21:04:17.441095
6	1	CREAR	productos	1	Producto creado: Alimento para Perro Adulto 15kg	2026-08-27 21:04:17.441095
7	1	CREAR	productos	2	Producto creado: Alimento para Gato Adulto 7kg	2026-08-27 21:04:17.441095
8	1	CREAR	productos	3	Producto creado: Alimento para Cachorro 3kg	2026-08-27 21:04:17.441095
9	1	CREAR	productos	4	Producto creado: Pelota de Goma Resistente	2026-08-27 21:04:17.441095
10	1	CREAR	productos	5	Producto creado: Ratón de Juguete con Catnip	2026-08-27 21:04:17.441095
11	1	CREAR	productos	6	Producto creado: Cuerda para Morder	2026-08-27 21:04:17.441095
12	1	CREAR	productos	7	Producto creado: Shampoo Antipulgas 500ml	2026-08-27 21:04:17.441095
13	1	CREAR	productos	8	Producto creado: Cepillo Deslanador	2026-08-27 21:04:17.441095
14	1	CREAR	productos	9	Producto creado: Correa Ajustable 1.5m	2026-08-27 21:04:17.441095
15	1	CREAR	productos	10	Producto creado: Collar Antipulgas	2026-08-27 21:04:17.441095
16	1	CREAR	productos	11	Producto creado: Cama Ortopédica Mediana	2026-08-27 21:04:17.441095
17	1	CREAR	productos	12	Producto creado: Vitaminas Multiuso 60 tabletas	2026-08-27 21:04:17.441095
18	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	1	ENTRADA de 40 unidades en producto 1 — motivo: Carga inicial de inventario	2026-08-27 21:04:17.441095
19	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	2	ENTRADA de 35 unidades en producto 2 — motivo: Carga inicial de inventario	2026-08-27 21:04:17.441095
20	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	3	ENTRADA de 8 unidades en producto 3 — motivo: Carga inicial de inventario	2026-08-27 21:04:17.441095
21	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	4	ENTRADA de 50 unidades en producto 4 — motivo: Carga inicial de inventario	2026-08-27 21:04:17.441095
22	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	5	ENTRADA de 30 unidades en producto 6 — motivo: Carga inicial de inventario	2026-08-27 21:04:17.441095
23	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	6	ENTRADA de 25 unidades en producto 7 — motivo: Carga inicial de inventario	2026-08-27 21:04:17.441095
24	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	7	ENTRADA de 6 unidades en producto 8 — motivo: Carga inicial de inventario	2026-08-27 21:04:17.441095
25	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	8	ENTRADA de 20 unidades en producto 9 — motivo: Carga inicial de inventario	2026-08-27 21:04:17.441095
26	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	9	ENTRADA de 18 unidades en producto 10 — motivo: Carga inicial de inventario	2026-08-27 21:04:17.441095
27	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	10	ENTRADA de 10 unidades en producto 11 — motivo: Carga inicial de inventario	2026-08-27 21:04:17.441095
28	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	11	ENTRADA de 15 unidades en producto 12 — motivo: Carga inicial de inventario	2026-08-27 21:04:17.441095
29	1	CREAR	servicios	1	Servicio creado: Baño Básico	2026-08-27 21:04:17.441095
30	1	CREAR	servicios	2	Servicio creado: Baño Medicado	2026-08-27 21:04:17.441095
31	1	CREAR	servicios	3	Servicio creado: Corte de Pelo	2026-08-27 21:04:17.441095
32	1	CREAR	servicios	4	Servicio creado: Corte de Uñas	2026-08-27 21:04:17.441095
33	1	CREAR	servicios	5	Servicio creado: Limpieza Dental	2026-08-27 21:04:17.441095
34	1	CREAR	servicios	6	Servicio creado: Desparasitación	2026-08-27 21:04:17.441095
35	1	CREAR	servicios	7	Servicio creado: Baño + Corte	2026-08-27 21:04:17.441095
36	1	CREAR	servicios	8	Servicio creado: Baño + Corte + Uñas	2026-08-27 21:04:17.441095
37	2	VENTA	compras	1	Venta F-000001 registrada por un total de 0.00	2026-08-27 21:04:17.441095
38	1	EDITAR	productos	1	Producto editado: Alimento para Perro Adulto 15kg	2026-08-27 21:04:17.441095
39	1	EDITAR	productos	4	Producto editado: Pelota de Goma Resistente	2026-08-27 21:04:17.441095
40	2	VENTA	compras	2	Venta F-000002 registrada por un total de 0.00	2026-08-27 21:04:17.441095
41	2	VENTA	compras	3	Venta F-000003 registrada por un total de 0.00	2026-08-27 21:04:17.441095
42	1	EDITAR	productos	7	Producto editado: Shampoo Antipulgas 500ml	2026-08-27 21:04:17.441095
43	1	EDITAR	productos	10	Producto editado: Collar Antipulgas	2026-08-27 21:04:17.441095
44	2	VENTA	compras	4	Venta F-000004 registrada por un total de 0.00	2026-08-27 21:04:17.441095
45	2	VENTA	compras	5	Venta F-000005 registrada por un total de 0.00	2026-08-27 21:04:17.441095
46	1	EDITAR	productos	2	Producto editado: Alimento para Gato Adulto 7kg	2026-08-27 21:04:17.441095
47	1	EDITAR	productos	12	Producto editado: Vitaminas Multiuso 60 tabletas	2026-08-27 21:04:17.441095
48	2	VENTA	compras	6	Venta F-000006 registrada por un total de 0.00	2026-08-27 21:04:17.441095
49	1	EDITAR	productos	11	Producto editado: Cama Ortopédica Mediana	2026-08-27 21:04:17.441095
50	2	VENTA	compras	7	Venta F-000007 registrada por un total de 0.00	2026-08-27 21:04:17.441095
51	1	EDITAR	productos	6	Producto editado: Cuerda para Morder	2026-08-27 21:04:17.441095
52	2	VENTA	compras	8	Venta F-000008 registrada por un total de 0.00	2026-08-27 21:04:17.441095
53	1	EDITAR	productos	1	Producto editado: Alimento para Perro Adulto 15kg	2026-08-27 21:04:17.441095
54	1	EDITAR	productos	3	Producto editado: Alimento para Cachorro 3kg	2026-08-27 21:04:17.441095
55	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	21	AJUSTE de 1 unidades en producto 3 — motivo: Ajuste positivo tras conteo físico de bodega (se encontró 1 unidad adicional)	2026-08-27 21:04:17.441095
56	1	EDITAR	productos	8	Producto editado: Cepillo Deslanador	2026-08-27 21:04:17.441095
57	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	22	AJUSTE de -1 unidades en producto 8 — motivo: Unidad dañada, dada de baja tras conteo físico	2026-08-27 21:04:17.441095
58	\N	CREAR	categorias	6	Categoría creada: Alimentos Test	2026-08-28 16:25:30.690434
59	1	CREAR	productos	13	Producto creado: Croquetas Test	2026-08-28 16:25:30.735597
60	1	EDITAR	productos	13	Producto editado: Croquetas Test	2026-08-28 16:25:30.735597
61	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	23	ENTRADA de 20 unidades en producto 13 — motivo: Carga inicial de inventario	2026-08-28 16:25:30.735597
62	\N	CREAR	servicios	9	Servicio creado: Ba�o y corte Test	2026-08-28 16:25:30.791048
63	1	CREAR	productos	14	Producto creado: Alimento para Perros DogChow 1.5 kg	2026-08-28 17:00:42.26982
64	1	EDITAR	productos	14	Producto editado: Alimento para Perros DogChow 1.5 kg	2026-08-28 17:00:42.26982
65	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	24	ENTRADA de 50 unidades en producto 14 — motivo: Carga inicial de inventario	2026-08-28 17:00:42.26982
66	1	CREAR	productos	15	Producto creado: Alimento para pericos Test	2026-08-28 17:18:25.252309
67	1	EDITAR	productos	15	Producto editado: Alimento para pericos Test	2026-08-28 17:18:25.252309
68	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	25	ENTRADA de 35 unidades en producto 15 — motivo: Carga inicial de inventario	2026-08-28 17:18:25.252309
69	2	VENTA	compras	9	Venta F-000009 registrada por un total de 0.00	2026-08-30 00:20:18.506367
70	\N	EDITAR	productos	3	Producto editado: Alimento para Cachorro 3kg	2026-08-30 00:20:18.506367
71	\N	EDITAR	productos	5	Producto editado: Ratón de Juguete con Catnip	2026-08-30 00:30:09.890802
72	\N	EDITAR	productos	5	Producto editado: Ratón de Juguete con Catnip	2026-08-30 00:30:22.914671
73	1	VENTA	compras	10	Venta F-000010 registrada por un total de 0.00	2026-08-30 00:30:47.967805
74	\N	EDITAR	productos	2	Producto editado: Alimento para Gato Adulto 7kg	2026-08-30 00:30:47.967805
75	1	VENTA	compras	11	Venta F-000011 registrada por un total de 0.00	2026-08-30 00:31:40.832342
76	\N	EDITAR	productos	8	Producto editado: Cepillo Deslanador	2026-08-30 00:31:40.832342
77	\N	EDITAR	productos	1	Producto editado: Alimento para Perro Adulto 15kg	2026-08-30 00:42:10.915278
78	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	29	AJUSTE de 5 unidades en producto 1 — motivo: Reabastecimiento	2026-08-30 00:42:10.915278
79	\N	EDITAR	productos	3	Producto editado: Alimento para Cachorro 3kg	2026-08-30 00:51:46.376818
80	\N	EDITAR	productos	3	Producto editado: Alimento para Cachorro 3kg	2026-08-30 00:51:46.391456
81	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	30	AJUSTE de 13 unidades en producto 3 — motivo: Ajuste desde catálogo	2026-08-30 00:51:46.391456
82	\N	EDITAR	productos	5	Producto editado: Ratón de Juguete con Catnip	2026-08-30 00:51:55.489807
83	\N	EDITAR	productos	5	Producto editado: Ratón de Juguete con Catnip	2026-08-30 00:51:55.496313
84	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	31	AJUSTE de 30 unidades en producto 5 — motivo: Ajuste desde catálogo	2026-08-30 00:51:55.496313
85	\N	EDITAR	servicios	5	Servicio editado: Limpieza Dental	2026-08-30 00:52:59.753893
86	\N	EDITAR	productos	8	Producto editado: Cepillo Deslanador	2026-08-30 01:04:34.366668
87	\N	EDITAR	productos	8	Producto editado: Cepillo Deslanador	2026-08-30 01:04:34.379833
88	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	32	AJUSTE de 36 unidades en producto 8 — motivo: Ajuste desde catálogo	2026-08-30 01:04:34.379833
89	1	VENTA	compras	12	Venta F-000012 registrada por un total de 0.00	2026-08-30 01:05:03.624995
90	\N	EDITAR	productos	11	Producto editado: Cama Ortopédica Mediana	2026-08-30 01:05:03.624995
91	\N	EDITAR	productos	10	Producto editado: Collar Antipulgas	2026-08-30 01:05:03.624995
92	\N	EDITAR	productos	14	Producto editado: Alimento para Perros DogChow 1.5 kg	2026-08-30 01:05:03.624995
93	\N	DESACTIVAR	productos	14	Producto desactivado: Alimento para Perros DogChow 1.5 kg	2026-08-30 01:43:04.68267
94	\N	EDITAR	productos	14	Producto editado: Alimento para Perros DogChow 1.5 kg	2026-08-30 01:43:05.580385
95	\N	DESACTIVAR	productos	14	Producto desactivado: Alimento para Perros DogChow 1.5 kg	2026-08-30 01:43:05.779015
96	\N	EDITAR	productos	14	Producto editado: Alimento para Perros DogChow 1.5 kg	2026-08-30 01:43:05.934997
97	\N	DESACTIVAR	servicios	9	Servicio desactivado: Ba�o y corte Test	2026-08-30 01:43:44.687911
98	\N	DESACTIVAR	productos	14	Producto desactivado: Alimento para Perros DogChow 1.5 kg	2026-08-30 01:53:03.457378
99	\N	EDITAR	productos	14	Producto editado: Alimento para Perros DogChow 1.5 kg	2026-08-30 01:53:10.289345
100	\N	DESACTIVAR	productos	14	Producto desactivado: Alimento para Perros DogChow 1.5 kg	2026-08-30 01:53:11.275038
101	\N	EDITAR	productos	14	Producto editado: Alimento para Perros DogChow 1.5 kg	2026-08-30 02:00:29.915497
102	\N	DESACTIVAR	productos	14	Producto desactivado: Alimento para Perros DogChow 1.5 kg	2026-08-30 02:00:33.638679
103	\N	EDITAR	productos	15	Producto editado: Alimento para pericos Test	2026-08-30 23:20:35.811347
104	\N	EDITAR	productos	15	Producto editado: Alimento para pericos Test	2026-08-30 23:20:35.879117
105	1	MOVIMIENTO_INVENTARIO	movimientos_inventario	36	AJUSTE de -66 unidades en producto 15 — motivo: Ajuste desde catálogo	2026-08-30 23:20:35.879117
106	\N	DESACTIVAR	productos	15	Producto desactivado: Alimento para pericos Test	2026-08-31 20:08:50.255555
107	\N	DESACTIVAR	servicios	2	Servicio desactivado: Baño Medicado	2026-08-31 20:09:15.638611
108	1	VENTA	compras	13	Venta F-000013 registrada por un total de 0.00	2026-08-31 21:52:47.780933
109	\N	EDITAR	productos	3	Producto editado: Alimento para Cachorro 3kg	2026-08-31 21:52:47.780933
\.


--
-- TOC entry 5405 (class 0 OID 16457)
-- Dependencies: 230
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categorias (id_categoria, nombre, descripcion, estado) FROM stdin;
1	Alimentos	Alimento seco y húmedo para perros, gatos y otras mascotas	t
2	Juguetes	Juguetes de entretenimiento y estimulación	t
3	Higiene	Productos de baño, cepillado y cuidado antipulgas	t
4	Accesorios	Correas, collares, camas y accesorios varios	t
5	Salud	Vitaminas y productos de cuidado básico de salud	t
6	Alimentos Test	Prueba	t
\.


--
-- TOC entry 5401 (class 0 OID 16430)
-- Dependencies: 226
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clientes (id_cliente, nombre, apellido, telefono, email, direccion, estado, fecha_registro, cedula) FROM stdin;
1	Juan	Pérez	6000-1111	juan.perez@example.com	Vía España, Ciudad de Panamá	t	2026-08-27 21:04:17.441095	8-101-2020
2	María	Rodríguez	6000-2222	maria.rodriguez@example.com	Costa del Este, Panamá	t	2026-08-27 21:04:17.441095	4-202-3030
3	Carlos	Gómez	6000-3333	carlos.gomez@example.com	Betania, Panamá	t	2026-08-27 21:04:17.441095	2-303-4040
4	Ana	Martínez	6000-4444	ana.martinez@example.com	San Francisco, Panamá	t	2026-08-27 21:04:17.441095	3-404-5050
5	Luis	Fernández	6000-5555	luis.fernandez@example.com	Bella Vista, Panamá	t	2026-08-27 21:04:17.441095	6-505-6060
6	Juan	Perez	6000-0000	\N	\N	t	2026-08-28 16:25:30.774188	9-606-7070
7	Mauro	Gonzalez	65816110	mauuu1410@gmail.com	\N	t	2026-08-28 17:01:02.418917	8-707-8080
8	Johao 	Santos	6767-6767	\N	\N	t	2026-08-30 00:52:24.446594	1-808-9090
9	Luis	Palma	6851-8537	\N	\N	t	2026-08-30 14:01:13.377555	5-909-1010
10	Ana	Pérez	\N	\N	\N	t	2026-08-31 20:56:47.619484	8-888-8888
12	Emerita	Gonzalez	62556283	\N	\N	t	2026-08-31 21:51:49.006692	9-160-253
\.


--
-- TOC entry 5419 (class 0 OID 16559)
-- Dependencies: 244
-- Data for Name: compra_producto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.compra_producto (id_detalle, id_compra, id_producto, cantidad, precio_unitario, subtotal) FROM stdin;
1	1	1	2	45.00	90.00
2	1	4	3	6.50	19.50
3	3	7	1	9.75	9.75
4	3	10	1	11.00	11.00
5	5	2	1	28.50	28.50
6	5	12	1	22.00	22.00
7	6	11	1	35.00	35.00
8	7	6	2	5.00	10.00
9	8	1	1	45.00	45.00
10	9	3	2	18.00	36.00
11	10	2	2	28.50	57.00
12	11	8	1	12.00	12.00
13	12	11	1	35.00	35.00
14	12	10	1	11.00	11.00
15	12	14	1	15.00	15.00
16	13	3	1	18.00	18.00
\.


--
-- TOC entry 5421 (class 0 OID 16572)
-- Dependencies: 246
-- Data for Name: compra_servicio; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.compra_servicio (id_detalle, id_compra, id_servicio, id_mascota, precio_unitario, subtotal) FROM stdin;
1	2	1	2	12.00	12.00
2	3	7	3	25.00	25.00
3	4	4	4	8.00	8.00
4	4	6	5	15.00	15.00
5	6	8	7	30.00	30.00
6	7	4	1	8.00	8.00
7	12	2	1	18.00	18.00
8	13	7	11	25.00	25.00
\.


--
-- TOC entry 5417 (class 0 OID 16539)
-- Dependencies: 242
-- Data for Name: compras; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.compras (id_compra, numero_factura, id_cliente, id_usuario, fecha, metodo_pago, subtotal, itbms, total, estado) FROM stdin;
1	F-000001	1	2	2026-07-18 21:04:17.441095	EFECTIVO	109.50	7.67	117.17	COMPLETADA
2	F-000002	1	2	2026-07-23 21:04:17.441095	TARJETA	12.00	0.84	12.84	COMPLETADA
3	F-000003	2	2	2026-07-30 21:04:17.441095	EFECTIVO	45.75	3.20	48.95	COMPLETADA
4	F-000004	3	2	2026-08-07 21:04:17.441095	TRANSFERENCIA	23.00	1.61	24.61	COMPLETADA
5	F-000005	4	2	2026-08-15 21:04:17.441095	EFECTIVO	50.50	3.54	54.04	COMPLETADA
6	F-000006	5	2	2026-08-22 21:04:17.441095	TARJETA	65.00	4.55	69.55	COMPLETADA
7	F-000007	1	2	2026-08-27 21:04:17.441095	EFECTIVO	18.00	1.26	19.26	COMPLETADA
8	F-000008	2	2	2026-08-27 21:04:17.441095	EFECTIVO	45.00	3.15	48.15	COMPLETADA
9	F-000009	4	2	2026-08-30 00:20:18.506367	EFECTIVO	36.00	2.52	38.52	COMPLETADA
10	F-000010	2	1	2026-08-30 00:30:47.967805	TRANSFERENCIA	57.00	3.99	60.99	COMPLETADA
11	F-000011	7	1	2026-08-30 00:31:40.832342	TRANSFERENCIA	12.00	0.84	12.84	COMPLETADA
12	F-000012	1	1	2026-08-30 01:05:03.624995	TARJETA	79.00	5.53	84.53	COMPLETADA
13	F-000013	12	1	2026-08-31 21:52:47.780933	TARJETA	43.00	3.01	46.01	COMPLETADA
\.


--
-- TOC entry 5415 (class 0 OID 16529)
-- Dependencies: 240
-- Data for Name: configuracion_sistema; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.configuracion_sistema (id_config, clave, valor, descripcion) FROM stdin;
1	ITBMS_PORCENTAJE	0.07	Tasa de ITBMS aplicada a subtotal de productos y servicios en cada venta
2	NOMBRE_NEGOCIO	MELO Pets	Nombre comercial mostrado en la interfaz y en los comprobantes
3	MAX_INTENTOS_LOGIN	5	Intentos fallidos de inicio de sesión antes de bloquear temporalmente la cuenta
4	MINUTOS_EXPIRACION_SESION	480	Minutos de inactividad antes de expirar la sesión (8 horas, jornada laboral)
5	BLOQUEO_MINUTOS_LOGIN	15	Minutos que dura el bloqueo de una cuenta tras superar MAX_INTENTOS_LOGIN
\.


--
-- TOC entry 5403 (class 0 OID 16444)
-- Dependencies: 228
-- Data for Name: mascotas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mascotas (id_mascota, id_cliente, nombre, especie, raza, sexo, fecha_nacimiento, peso, observaciones, estado) FROM stdin;
1	1	Max	Perro	Labrador	M	2021-03-15	28.50	\N	t
2	1	Luna	Gato	Mestizo	H	2022-07-02	4.20	\N	t
3	2	Rocky	Perro	Bulldog Francés	M	2020-11-20	12.00	\N	t
4	3	Michi	Gato	Siamés	H	2019-05-08	3.80	\N	t
5	3	Toby	Perro	Chihuahua	M	2023-01-30	2.50	\N	t
6	4	Nina	Gato	Persa	H	2021-09-12	4.50	\N	t
7	5	Zeus	Perro	Pastor Alemán	M	2020-02-25	34.00	\N	t
8	5	Coco	Ave	Periquito	H	2023-06-10	0.04	\N	t
9	6	Firulais	Perro	\N	\N	\N	\N	\N	t
10	9	Oscar	Perro	Pastor Belga	\N	\N	\N	\N	t
11	12	Pirulais	Perro	Golden Retriever	\N	\N	\N	\N	t
\.


--
-- TOC entry 5409 (class 0 OID 16487)
-- Dependencies: 234
-- Data for Name: movimientos_inventario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.movimientos_inventario (id_movimiento, id_producto, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, id_usuario, id_compra, fecha) FROM stdin;
1	1	ENTRADA	40	0	40	Carga inicial de inventario	1	\N	2026-08-07 21:04:17.441095
2	2	ENTRADA	35	0	35	Carga inicial de inventario	1	\N	2026-08-07 21:04:17.441095
3	3	ENTRADA	8	0	8	Carga inicial de inventario	1	\N	2026-08-07 21:04:17.441095
4	4	ENTRADA	50	0	50	Carga inicial de inventario	1	\N	2026-08-07 21:04:17.441095
5	6	ENTRADA	30	0	30	Carga inicial de inventario	1	\N	2026-08-07 21:04:17.441095
6	7	ENTRADA	25	0	25	Carga inicial de inventario	1	\N	2026-08-07 21:04:17.441095
7	8	ENTRADA	6	0	6	Carga inicial de inventario	1	\N	2026-08-07 21:04:17.441095
8	9	ENTRADA	20	0	20	Carga inicial de inventario	1	\N	2026-08-07 21:04:17.441095
9	10	ENTRADA	18	0	18	Carga inicial de inventario	1	\N	2026-08-07 21:04:17.441095
10	11	ENTRADA	10	0	10	Carga inicial de inventario	1	\N	2026-08-07 21:04:17.441095
11	12	ENTRADA	15	0	15	Carga inicial de inventario	1	\N	2026-08-07 21:04:17.441095
12	1	SALIDA	-2	40	38	Venta F-000001	2	1	2026-08-27 21:04:17.441095
13	4	SALIDA	-3	50	47	Venta F-000001	2	1	2026-08-27 21:04:17.441095
14	7	SALIDA	-1	25	24	Venta F-000003	2	3	2026-08-27 21:04:17.441095
15	10	SALIDA	-1	18	17	Venta F-000003	2	3	2026-08-27 21:04:17.441095
16	2	SALIDA	-1	35	34	Venta F-000005	2	5	2026-08-27 21:04:17.441095
17	12	SALIDA	-1	15	14	Venta F-000005	2	5	2026-08-27 21:04:17.441095
18	11	SALIDA	-1	10	9	Venta F-000006	2	6	2026-08-27 21:04:17.441095
19	6	SALIDA	-2	30	28	Venta F-000007	2	7	2026-08-27 21:04:17.441095
20	1	SALIDA	-1	38	37	Venta F-000008	2	8	2026-08-27 21:04:17.441095
21	3	AJUSTE	1	8	9	Ajuste positivo tras conteo físico de bodega (se encontró 1 unidad adicional)	1	\N	2026-08-27 21:04:17.441095
22	8	AJUSTE	-1	6	5	Unidad dañada, dada de baja tras conteo físico	1	\N	2026-08-27 21:04:17.441095
23	13	ENTRADA	20	20	40	Carga inicial de inventario	1	\N	2026-08-28 16:25:30.735597
24	14	ENTRADA	50	50	100	Carga inicial de inventario	1	\N	2026-08-28 17:00:42.26982
25	15	ENTRADA	35	35	70	Carga inicial de inventario	1	\N	2026-08-28 17:18:25.252309
26	3	SALIDA	-2	9	7	Venta F-000009	2	9	2026-08-30 00:20:18.506367
27	2	SALIDA	-2	34	32	Venta F-000010	1	10	2026-08-30 00:30:47.967805
28	8	SALIDA	-1	5	4	Venta F-000011	1	11	2026-08-30 00:31:40.832342
29	1	AJUSTE	5	37	42	Reabastecimiento	1	\N	2026-08-30 00:42:10.915278
30	3	AJUSTE	13	7	20	Ajuste desde catálogo	1	\N	2026-08-30 00:51:46.391456
31	5	AJUSTE	30	0	30	Ajuste desde catálogo	1	\N	2026-08-30 00:51:55.496313
32	8	AJUSTE	36	4	40	Ajuste desde catálogo	1	\N	2026-08-30 01:04:34.379833
33	11	SALIDA	-1	9	8	Venta F-000012	1	12	2026-08-30 01:05:03.624995
34	10	SALIDA	-1	17	16	Venta F-000012	1	12	2026-08-30 01:05:03.624995
35	14	SALIDA	-1	100	99	Venta F-000012	1	12	2026-08-30 01:05:03.624995
36	15	AJUSTE	-66	70	4	Ajuste desde catálogo	1	\N	2026-08-30 23:20:35.879117
37	3	SALIDA	-1	20	19	Venta F-000013	1	13	2026-08-31 21:52:47.780933
\.


--
-- TOC entry 5407 (class 0 OID 16468)
-- Dependencies: 232
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.productos (id_producto, id_categoria, nombre, descripcion, precio, stock, stock_minimo, estado, fecha_creacion) FROM stdin;
9	4	Correa Ajustable 1.5m	Correa resistente ajustable en 3 tallas	14.50	20	5	t	2026-08-27 21:04:17.441095
4	2	Pelota de Goma Resistente	Juguete de goma resistente a mordidas	6.50	47	15	t	2026-08-27 21:04:17.441095
7	3	Shampoo Antipulgas 500ml	Shampoo medicado antipulgas y garrapatas	9.75	24	8	t	2026-08-27 21:04:17.441095
12	5	Vitaminas Multiuso 60 tabletas	Suplemento vitamínico para perros y gatos adultos	22.00	14	5	t	2026-08-27 21:04:17.441095
6	2	Cuerda para Morder	Cuerda de algodón trenzado para masticar	5.00	28	10	t	2026-08-27 21:04:17.441095
13	6	Croquetas Test	\N	15.99	40	5	t	2026-08-28 16:25:30.735597
2	1	Alimento para Gato Adulto 7kg	Alimento seco premium para gatos adultos	28.50	32	10	t	2026-08-27 21:04:17.441095
1	1	Alimento para Perro Adulto 15kg	Fórmula balanceada para perros adultos de todas las razas	45.00	42	10	t	2026-08-27 21:04:17.441095
5	2	Ratón de Juguete con Catnip	Juguete para gatos relleno de catnip	4.25	30	10	t	2026-08-27 21:04:17.441095
8	3	Cepillo Deslanador	Cepillo para remover pelo suelto	12.00	40	8	t	2026-08-27 21:04:17.441095
11	4	Cama Ortopédica Mediana	Cama con espuma viscoelástica para mascotas medianas	35.00	8	3	t	2026-08-27 21:04:17.441095
10	4	Collar Antipulgas	Collar de liberación prolongada, 8 meses de protección	11.00	16	5	t	2026-08-27 21:04:17.441095
14	1	Alimento para Perros DogChow 1.5 kg	\N	15.00	99	10	f	2026-08-28 17:00:42.26982
15	1	Alimento para pericos Test	\N	5.75	4	5	f	2026-08-28 17:18:25.252309
3	1	Alimento para Cachorro 3kg	Fórmula de crecimiento para cachorros	18.00	19	10	t	2026-08-27 21:04:17.441095
\.


--
-- TOC entry 5397 (class 0 OID 16397)
-- Dependencies: 222
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id_rol, nombre_rol, descripcion) FROM stdin;
1	CAJERO	Atiende el punto de venta: registra ventas de productos y servicios, consulta catálogos y clientes
2	GERENTE	Administra catálogo, inventario y servicios; consulta dashboard, reportes y auditoría
\.


--
-- TOC entry 5413 (class 0 OID 16514)
-- Dependencies: 238
-- Data for Name: servicios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.servicios (id_servicio, id_tipo_servicio, nombre, descripcion, precio, duracion_estimada, estado, fecha_creacion) FROM stdin;
1	1	Baño Básico	Baño con shampoo neutro y secado	12.00	30	t	2026-08-27 21:04:17.441095
3	2	Corte de Pelo	Corte de pelo según raza	15.00	45	t	2026-08-27 21:04:17.441095
4	2	Corte de Uñas	Corte y limado de uñas	8.00	15	t	2026-08-27 21:04:17.441095
6	3	Desparasitación	Aplicación de antiparasitario interno	15.00	20	t	2026-08-27 21:04:17.441095
7	4	Baño + Corte	Combo de baño básico y corte de pelo	25.00	60	t	2026-08-27 21:04:17.441095
8	4	Baño + Corte + Uñas	Combo completo de estética	30.00	75	t	2026-08-27 21:04:17.441095
5	3	Limpieza Dental	Limpieza dental básica sin anestesia	35.00	30	t	2026-08-27 21:04:17.441095
9	5	Ba�o y corte Test	\N	12.00	30	f	2026-08-28 16:25:30.791048
2	1	Baño Medicado	Baño con shampoo medicado antipulgas	18.00	40	f	2026-08-27 21:04:17.441095
\.


--
-- TOC entry 5425 (class 0 OID 16597)
-- Dependencies: 250
-- Data for Name: sesiones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sesiones (id_sesion, id_usuario, token_hash, fecha_creacion, fecha_expiracion, revocado) FROM stdin;
1	1	daa1a99c0cf10e6fa95e639f2242058f11bf6302fe83b800a5d52dc065e7758d	2026-08-27 23:57:38.785367	2026-08-28 12:57:38.784	t
2	2	945c47c8327a7ca60e558ee5fb261d36a1b4963fb79e8518ed8d3618f56baa46	2026-08-27 23:58:44.871922	2026-08-28 12:58:44.871	f
3	1	40520220a5d6abbdcfcd26d183dacb30cd8e276aefdf32ab5add98de88d2cbf2	2026-08-28 07:50:23.707991	2026-08-28 20:50:23.707	t
4	1	f1564fcb390718e3d3fa73394475fe5a035986fda150c81f2955d0acd2eb0d4d	2026-08-28 08:30:02.794195	2026-08-28 21:30:02.788	f
5	1	320ea0855ae34540053e0da80da50af5715491f8af56140d1a2ea3f75b016ad8	2026-08-28 10:16:54.616994	2026-08-28 23:16:54.616	t
6	1	6223ae2f303457ba643839d15b880f55e50a38c59e81085aff6bfae0a049c769	2026-08-28 16:19:42.342074	2026-08-29 05:19:42.34	t
7	1	771ded1f6fe6f641eed4e66c0c28d8eea7316fd4f7ff4174817d1e473d96fbba	2026-08-28 16:25:30.672651	2026-08-29 05:25:30.666	f
8	1	90446815828ae0e8cc1dddabdd5280390cbacae8cdbb074413291512ec53e644	2026-08-28 16:59:51.376982	2026-08-29 05:59:51.376	f
9	2	c99eeb145d64b31060980315585328ed0a4d7676abdd51e68f74af0650a1998e	2026-08-30 00:20:18.451887	2026-08-30 13:20:18.45	f
11	1	bb7713c73c42dc134322935a2f63c4b2b5672d7c99c694a0cc29f5f6ae8e4ec6	2026-08-30 00:42:10.861676	2026-08-30 13:42:10.861	f
12	1	0ae1f7f701cd4b4a0543d9e17d93c27e33cc4f4341640ea9d46ac20bf6c77234	2026-08-30 01:02:34.406905	2026-08-30 14:02:34.405	f
10	1	6299086a2dbe518ee522763f26776486503dd17bcae02fcf282477c2c19cb4fa	2026-08-30 00:29:46.961014	2026-08-30 13:29:46.96	t
13	1	94e4b47a3ab44f05a1abfaefc95365a422efb1847a52bfc806b37fdf40b3c7c2	2026-08-30 01:04:11.667606	2026-08-30 14:04:11.666	t
15	1	6d1e407307e12b687398bb46a9c28113786bf192448b6390a1678d348aac55ff	2026-08-30 01:10:58.592166	2026-08-30 14:10:58.591	f
14	2	cdecf4287e4357f1903feb7fd96859a2544bbcfef437c3b540b3a7158387eaeb	2026-08-30 01:08:38.746403	2026-08-30 14:08:38.746	t
16	1	9d34dfd28e3ffdcf65241406381e00429743aac6b6c672e56a641ad18b316836	2026-08-30 01:18:11.821898	2026-08-30 14:18:11.818	t
17	2	286bbb073b9760657597293cc90f35eb1eb0d8749442cc6b9371df473d912ed7	2026-08-30 01:18:28.881463	2026-08-30 14:18:28.878	t
18	1	d668b63e83053eee302132b418a74ab0460df219e10647e2e03838f6f44855bf	2026-08-30 01:22:07.034873	2026-08-30 14:22:07.028	t
19	1	3c4218a129b1ddd39371526c282fd5d8bb828b6316122cd12c9c245bf0873097	2026-08-30 01:31:54.831634	2026-08-30 14:31:54.83	t
20	1	fb432dda09392560b37ce4ea28e4d2c6386f12f0840e30b69c32ed7c2dbe1168	2026-08-30 01:42:51.773899	2026-08-30 14:42:51.773	f
21	1	c2add81962e39778eb857f767540fc5810efcf571b81c49be107bb2a582c2cb8	2026-08-30 13:52:21.601374	2026-08-31 02:52:21.6	f
22	1	4345066abfb38cc63c04787544b4a9d64cdacff28ee43177927726820e065e98	2026-08-30 14:00:36.039311	2026-08-31 03:00:36.038	t
23	2	1a5d0dfaa9bc5199f306f3d7065e2ce51961216b25156ab7df3daf34ed65eb27	2026-08-30 14:02:31.473681	2026-08-31 03:02:31.48	t
24	1	4a46cebd05c1bda2bceb0f87c2d8f3b86c3e837462de9613b7d422990ca12d80	2026-08-30 14:03:01.158642	2026-08-31 03:03:01.159	f
25	1	4021e6dcaff3794c8e778054144045a187b4eb7c35bc49a72875e465b2c0820a	2026-08-30 16:45:19.981894	2026-08-31 05:45:19.981	t
26	1	27c293db31c31dd7795cdc18bfafb80ced3d383b477674f2c696c112d9a7e895	2026-08-30 22:59:37.204851	2026-08-31 11:59:37.204	t
27	1	df441fc4da7373ef1c5a39d769e2c1ad11ba4b8fb55ff0d38c19f104c305d91d	2026-08-30 23:05:53.306677	2026-08-31 12:05:53.305	t
28	1	68147b09e8ebb0a7f58dab6530b1a9aefb9d748592f55a2e5ab80b590faa78ab	2026-08-30 23:07:13.959928	2026-08-31 12:07:13.959	t
29	1	ef79c8b1498ce11cff9034e870c9e5964d1f2940cd2c9dd91209cf4d59eee6c3	2026-08-30 23:09:13.102693	2026-08-31 12:09:13.102	f
30	1	9d18832c2827a595371787e2c56b7ad2dcb73fb365f5258aa954ab4731c39662	2026-08-30 23:19:00.435805	2026-08-31 12:19:00.435	t
31	1	1f9e97d00671e67d103f118ee7aa35ef1eab28699d6badd9f69b9be686fa1680	2026-08-30 23:20:11.083161	2026-08-31 12:20:11.082	t
32	1	ffcc03b7e59eae4de6b36892b7e68b3bc6ea3b11b080e68d9a109f57aaf3a380	2026-08-30 23:21:18.372716	2026-08-31 12:21:18.371	t
33	1	12db2c837cfa9561767fcb612c47657ad785f81f1ab51bb03dedffee2ad1dd40	2026-08-30 23:27:26.250757	2026-08-31 12:27:26.249	f
34	1	5db37ff1bda04e111978ab438315003b68c8ef4ecb8bbefb7df55f9806de5ca8	2026-08-30 23:28:12.040682	2026-08-31 12:28:12.039	f
35	1	60197824a0246f3aca95ab463460459a092b53d20c2467eb2704d9c8ffff17ad	2026-08-31 19:11:14.880614	2026-09-01 08:11:14.88	t
36	1	e81f4023daf12f12fd8a155373a401008a2dcca3ee08472f8f0e8fe78f032368	2026-08-31 20:08:32.186567	2026-09-01 09:08:32.185	t
37	2	3e81c72b0997e73f686718315eb9f06ea9a3053890a647d079360f753a3006a3	2026-08-31 20:09:47.696092	2026-09-01 09:09:47.695	t
39	1	8283859cd9a1e77ec7cc2ee4d33cafe7ec8b8bb4d3ef759bb4ac6aaa7efcd4f1	2026-08-31 20:55:51.01277	2026-09-01 09:55:51.012	f
40	1	5e95fbe1bbbed5be817365f7a100ddbf78ddd84790c9117e1d8fe62c41c33a2e	2026-08-31 20:56:47.611394	2026-09-01 09:56:47.61	f
38	2	39fa1a755ee280901ef7f67b179256333f829bb29abc7f821dec0357d1602d18	2026-08-31 20:24:44.175402	2026-09-01 09:24:44.174	t
41	1	8a0373db29810a71e6876dc1b94215d9fdc466ff95824847a8d7c35ea82e15f6	2026-08-31 21:20:52.970001	2026-09-01 10:20:52.969	t
42	2	8da4b5230cd1a8c7e7c67f69c42791d1e618e5f09cb12a8f341f48554468205a	2026-08-31 21:22:04.14123	2026-09-01 10:22:04.14	t
43	1	097f4c32acd09e7235bd9e8b42a1540179bd2e79b06e47f7fa0de66ec1cb606d	2026-08-31 21:25:42.694729	2026-09-01 10:25:42.693	t
44	1	508dce73bad858bf5d010aa29db5d291364f7f41c43efb565f91fe5e1986023b	2026-08-31 21:51:12.873831	2026-09-01 10:51:12.873	f
\.


--
-- TOC entry 5411 (class 0 OID 16503)
-- Dependencies: 236
-- Data for Name: tipos_servicio; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipos_servicio (id_tipo_servicio, nombre, descripcion, estado) FROM stdin;
1	Baño y Estética	Servicios de baño e higiene general	t
2	Corte y Peluquería	Corte de pelo y uñas	t
3	Cuidado de Salud	Servicios preventivos básicos de salud	t
4	Combos	Paquetes que combinan varios servicios	t
5	Ba�o Test	Prueba	t
\.


--
-- TOC entry 5399 (class 0 OID 16406)
-- Dependencies: 224
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id_usuario, nombre, apellido, email, username, password_hash, id_rol, estado, intentos_fallidos, debe_cambiar_password, fecha_creacion, ultimo_login, bloqueado_hasta) FROM stdin;
2	Diego	Reyes	diego.reyes@melopets.com	diego.cajero	$2a$10$SfQ4amZb9sLXePCOKJ6Q4Ov7i6J5.GNEj/roQ5Mu0DlgPGULPt9yG	1	t	0	t	2026-08-27 21:04:06.189847	2026-08-31 21:22:04.140098	\N
1	Melissa	Ortega	melissa.ortega@melopets.com	melissa.gerente	$2a$10$OkwgberLnXls8QOs8HVr6ePIuShyjsmQV7LW0LzGVQ4zl6a90uqZG	2	t	0	t	2026-08-27 21:04:06.189847	2026-08-31 21:51:12.870376	\N
\.


--
-- TOC entry 5469 (class 0 OID 0)
-- Dependencies: 247
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auditoria_id_auditoria_seq', 109, true);


--
-- TOC entry 5470 (class 0 OID 0)
-- Dependencies: 229
-- Name: categorias_id_categoria_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categorias_id_categoria_seq', 6, true);


--
-- TOC entry 5471 (class 0 OID 0)
-- Dependencies: 225
-- Name: clientes_id_cliente_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clientes_id_cliente_seq', 12, true);


--
-- TOC entry 5472 (class 0 OID 0)
-- Dependencies: 243
-- Name: compra_producto_id_detalle_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.compra_producto_id_detalle_seq', 16, true);


--
-- TOC entry 5473 (class 0 OID 0)
-- Dependencies: 245
-- Name: compra_servicio_id_detalle_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.compra_servicio_id_detalle_seq', 8, true);


--
-- TOC entry 5474 (class 0 OID 0)
-- Dependencies: 241
-- Name: compras_id_compra_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.compras_id_compra_seq', 13, true);


--
-- TOC entry 5475 (class 0 OID 0)
-- Dependencies: 239
-- Name: configuracion_sistema_id_config_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.configuracion_sistema_id_config_seq', 5, true);


--
-- TOC entry 5476 (class 0 OID 0)
-- Dependencies: 227
-- Name: mascotas_id_mascota_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mascotas_id_mascota_seq', 11, true);


--
-- TOC entry 5477 (class 0 OID 0)
-- Dependencies: 233
-- Name: movimientos_inventario_id_movimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.movimientos_inventario_id_movimiento_seq', 37, true);


--
-- TOC entry 5478 (class 0 OID 0)
-- Dependencies: 231
-- Name: productos_id_producto_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.productos_id_producto_seq', 15, true);


--
-- TOC entry 5479 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_rol_seq', 2, true);


--
-- TOC entry 5480 (class 0 OID 0)
-- Dependencies: 251
-- Name: seq_numero_factura; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_numero_factura', 13, true);


--
-- TOC entry 5481 (class 0 OID 0)
-- Dependencies: 237
-- Name: servicios_id_servicio_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.servicios_id_servicio_seq', 9, true);


--
-- TOC entry 5482 (class 0 OID 0)
-- Dependencies: 249
-- Name: sesiones_id_sesion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sesiones_id_sesion_seq', 44, true);


--
-- TOC entry 5483 (class 0 OID 0)
-- Dependencies: 235
-- Name: tipos_servicio_id_tipo_servicio_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipos_servicio_id_tipo_servicio_seq', 5, true);


--
-- TOC entry 5484 (class 0 OID 0)
-- Dependencies: 223
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 2, true);


--
-- TOC entry 5206 (class 2606 OID 16595)
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id_auditoria);


--
-- TOC entry 5163 (class 2606 OID 16466)
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria);


--
-- TOC entry 5150 (class 2606 OID 16961)
-- Name: clientes clientes_cedula_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_cedula_key UNIQUE (cedula);


--
-- TOC entry 5152 (class 2606 OID 16442)
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id_cliente);


--
-- TOC entry 5197 (class 2606 OID 16570)
-- Name: compra_producto compra_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compra_producto
    ADD CONSTRAINT compra_producto_pkey PRIMARY KEY (id_detalle);


--
-- TOC entry 5201 (class 2606 OID 16583)
-- Name: compra_servicio compra_servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compra_servicio
    ADD CONSTRAINT compra_servicio_pkey PRIMARY KEY (id_detalle);


--
-- TOC entry 5189 (class 2606 OID 16557)
-- Name: compras compras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_pkey PRIMARY KEY (id_compra);


--
-- TOC entry 5185 (class 2606 OID 16537)
-- Name: configuracion_sistema configuracion_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT configuracion_sistema_pkey PRIMARY KEY (id_config);


--
-- TOC entry 5161 (class 2606 OID 16455)
-- Name: mascotas mascotas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mascotas
    ADD CONSTRAINT mascotas_pkey PRIMARY KEY (id_mascota);


--
-- TOC entry 5175 (class 2606 OID 16501)
-- Name: movimientos_inventario movimientos_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_pkey PRIMARY KEY (id_movimiento);


--
-- TOC entry 5171 (class 2606 OID 16485)
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id_producto);


--
-- TOC entry 5140 (class 2606 OID 16404)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 5183 (class 2606 OID 16527)
-- Name: servicios servicios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT servicios_pkey PRIMARY KEY (id_servicio);


--
-- TOC entry 5213 (class 2606 OID 16610)
-- Name: sesiones sesiones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT sesiones_pkey PRIMARY KEY (id_sesion);


--
-- TOC entry 5177 (class 2606 OID 16512)
-- Name: tipos_servicio tipos_servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_servicio
    ADD CONSTRAINT tipos_servicio_pkey PRIMARY KEY (id_tipo_servicio);


--
-- TOC entry 5165 (class 2606 OID 16637)
-- Name: categorias uq_categorias_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT uq_categorias_nombre UNIQUE (nombre);


--
-- TOC entry 5156 (class 2606 OID 16626)
-- Name: clientes uq_clientes_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT uq_clientes_email UNIQUE (email);


--
-- TOC entry 5195 (class 2606 OID 16677)
-- Name: compras uq_compras_numero_factura; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT uq_compras_numero_factura UNIQUE (numero_factura);


--
-- TOC entry 5187 (class 2606 OID 16675)
-- Name: configuracion_sistema uq_config_clave; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT uq_config_clave UNIQUE (clave);


--
-- TOC entry 5142 (class 2606 OID 16612)
-- Name: roles uq_roles_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT uq_roles_nombre UNIQUE (nombre_rol);


--
-- TOC entry 5179 (class 2606 OID 16666)
-- Name: tipos_servicio uq_tipos_servicio_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_servicio
    ADD CONSTRAINT uq_tipos_servicio_nombre UNIQUE (nombre);


--
-- TOC entry 5144 (class 2606 OID 16615)
-- Name: usuarios uq_usuarios_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT uq_usuarios_email UNIQUE (email);


--
-- TOC entry 5146 (class 2606 OID 16617)
-- Name: usuarios uq_usuarios_username; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT uq_usuarios_username UNIQUE (username);


--
-- TOC entry 5148 (class 2606 OID 16428)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 5207 (class 1259 OID 16839)
-- Name: idx_auditoria_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auditoria_fecha ON public.auditoria USING btree (fecha_hora DESC);


--
-- TOC entry 5208 (class 1259 OID 16838)
-- Name: idx_auditoria_tabla; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auditoria_tabla ON public.auditoria USING btree (tabla_afectada);


--
-- TOC entry 5209 (class 1259 OID 16837)
-- Name: idx_auditoria_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auditoria_usuario ON public.auditoria USING btree (id_usuario);


--
-- TOC entry 5153 (class 1259 OID 16815)
-- Name: idx_clientes_nombre_apellido; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clientes_nombre_apellido ON public.clientes USING btree (nombre, apellido);


--
-- TOC entry 5154 (class 1259 OID 16816)
-- Name: idx_clientes_nombre_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clientes_nombre_trgm ON public.clientes USING gin (((((nombre)::text || ' '::text) || (apellido)::text)) public.gin_trgm_ops);


--
-- TOC entry 5198 (class 1259 OID 16832)
-- Name: idx_compra_producto_compra; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_compra_producto_compra ON public.compra_producto USING btree (id_compra);


--
-- TOC entry 5199 (class 1259 OID 16833)
-- Name: idx_compra_producto_producto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_compra_producto_producto ON public.compra_producto USING btree (id_producto);


--
-- TOC entry 5202 (class 1259 OID 16834)
-- Name: idx_compra_servicio_compra; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_compra_servicio_compra ON public.compra_servicio USING btree (id_compra);


--
-- TOC entry 5203 (class 1259 OID 16835)
-- Name: idx_compra_servicio_mascota; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_compra_servicio_mascota ON public.compra_servicio USING btree (id_mascota);


--
-- TOC entry 5204 (class 1259 OID 16836)
-- Name: idx_compra_servicio_servicio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_compra_servicio_servicio ON public.compra_servicio USING btree (id_servicio);


--
-- TOC entry 5190 (class 1259 OID 16828)
-- Name: idx_compras_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_compras_cliente ON public.compras USING btree (id_cliente);


--
-- TOC entry 5191 (class 1259 OID 16831)
-- Name: idx_compras_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_compras_estado ON public.compras USING btree (estado);


--
-- TOC entry 5192 (class 1259 OID 16830)
-- Name: idx_compras_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_compras_fecha ON public.compras USING btree (fecha DESC);


--
-- TOC entry 5193 (class 1259 OID 16829)
-- Name: idx_compras_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_compras_usuario ON public.compras USING btree (id_usuario);


--
-- TOC entry 5157 (class 1259 OID 16817)
-- Name: idx_mascotas_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mascotas_cliente ON public.mascotas USING btree (id_cliente);


--
-- TOC entry 5158 (class 1259 OID 16819)
-- Name: idx_mascotas_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mascotas_estado ON public.mascotas USING btree (estado);


--
-- TOC entry 5159 (class 1259 OID 16818)
-- Name: idx_mascotas_nombre_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mascotas_nombre_trgm ON public.mascotas USING gin (nombre public.gin_trgm_ops);


--
-- TOC entry 5172 (class 1259 OID 16825)
-- Name: idx_movimientos_compra; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_movimientos_compra ON public.movimientos_inventario USING btree (id_compra);


--
-- TOC entry 5173 (class 1259 OID 16824)
-- Name: idx_movimientos_producto_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_movimientos_producto_fecha ON public.movimientos_inventario USING btree (id_producto, fecha DESC);


--
-- TOC entry 5166 (class 1259 OID 16820)
-- Name: idx_productos_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_categoria ON public.productos USING btree (id_categoria);


--
-- TOC entry 5167 (class 1259 OID 16821)
-- Name: idx_productos_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_estado ON public.productos USING btree (estado);


--
-- TOC entry 5168 (class 1259 OID 16822)
-- Name: idx_productos_nombre_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_nombre_trgm ON public.productos USING gin (nombre public.gin_trgm_ops);


--
-- TOC entry 5169 (class 1259 OID 16823)
-- Name: idx_productos_stock; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_stock ON public.productos USING btree (stock) WHERE (estado = true);


--
-- TOC entry 5180 (class 1259 OID 16827)
-- Name: idx_servicios_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_servicios_estado ON public.servicios USING btree (estado);


--
-- TOC entry 5181 (class 1259 OID 16826)
-- Name: idx_servicios_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_servicios_tipo ON public.servicios USING btree (id_tipo_servicio);


--
-- TOC entry 5210 (class 1259 OID 16841)
-- Name: idx_sesiones_expiracion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sesiones_expiracion ON public.sesiones USING btree (fecha_expiracion) WHERE (revocado = false);


--
-- TOC entry 5211 (class 1259 OID 16840)
-- Name: idx_sesiones_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sesiones_usuario ON public.sesiones USING btree (id_usuario);


--
-- TOC entry 5230 (class 2620 OID 16855)
-- Name: categorias trg_auditoria_categorias; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditoria_categorias AFTER INSERT OR UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_categorias();


--
-- TOC entry 5234 (class 2620 OID 16857)
-- Name: compras trg_auditoria_compras; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditoria_compras AFTER INSERT ON public.compras FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_compras();


--
-- TOC entry 5232 (class 2620 OID 16859)
-- Name: movimientos_inventario trg_auditoria_inventario; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditoria_inventario AFTER INSERT ON public.movimientos_inventario FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inventario();


--
-- TOC entry 5231 (class 2620 OID 16851)
-- Name: productos trg_auditoria_productos; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditoria_productos AFTER INSERT OR UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_productos();


--
-- TOC entry 5233 (class 2620 OID 16853)
-- Name: servicios trg_auditoria_servicios; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditoria_servicios AFTER INSERT OR UPDATE ON public.servicios FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_servicios();


--
-- TOC entry 5235 (class 2620 OID 16861)
-- Name: compra_producto trg_validar_stock_compra_producto; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validar_stock_compra_producto BEFORE INSERT ON public.compra_producto FOR EACH ROW EXECUTE FUNCTION public.fn_validar_stock_compra_producto();


--
-- TOC entry 5228 (class 2606 OID 16724)
-- Name: auditoria fk_auditoria_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT fk_auditoria_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE SET NULL;


--
-- TOC entry 5223 (class 2606 OID 16694)
-- Name: compra_producto fk_compra_producto_compra; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compra_producto
    ADD CONSTRAINT fk_compra_producto_compra FOREIGN KEY (id_compra) REFERENCES public.compras(id_compra) ON DELETE CASCADE;


--
-- TOC entry 5224 (class 2606 OID 16699)
-- Name: compra_producto fk_compra_producto_producto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compra_producto
    ADD CONSTRAINT fk_compra_producto_producto FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE RESTRICT;


--
-- TOC entry 5225 (class 2606 OID 16707)
-- Name: compra_servicio fk_compra_servicio_compra; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compra_servicio
    ADD CONSTRAINT fk_compra_servicio_compra FOREIGN KEY (id_compra) REFERENCES public.compras(id_compra) ON DELETE CASCADE;


--
-- TOC entry 5226 (class 2606 OID 16717)
-- Name: compra_servicio fk_compra_servicio_mascota; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compra_servicio
    ADD CONSTRAINT fk_compra_servicio_mascota FOREIGN KEY (id_mascota) REFERENCES public.mascotas(id_mascota) ON DELETE RESTRICT;


--
-- TOC entry 5227 (class 2606 OID 16712)
-- Name: compra_servicio fk_compra_servicio_servicio; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compra_servicio
    ADD CONSTRAINT fk_compra_servicio_servicio FOREIGN KEY (id_servicio) REFERENCES public.servicios(id_servicio) ON DELETE RESTRICT;


--
-- TOC entry 5221 (class 2606 OID 16678)
-- Name: compras fk_compras_cliente; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT fk_compras_cliente FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente) ON DELETE RESTRICT;


--
-- TOC entry 5222 (class 2606 OID 16683)
-- Name: compras fk_compras_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT fk_compras_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE RESTRICT;


--
-- TOC entry 5215 (class 2606 OID 16628)
-- Name: mascotas fk_mascotas_cliente; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mascotas
    ADD CONSTRAINT fk_mascotas_cliente FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente) ON DELETE CASCADE;


--
-- TOC entry 5217 (class 2606 OID 16656)
-- Name: movimientos_inventario fk_movimientos_compra; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT fk_movimientos_compra FOREIGN KEY (id_compra) REFERENCES public.compras(id_compra) ON DELETE SET NULL;


--
-- TOC entry 5218 (class 2606 OID 16646)
-- Name: movimientos_inventario fk_movimientos_producto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT fk_movimientos_producto FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE RESTRICT;


--
-- TOC entry 5219 (class 2606 OID 16651)
-- Name: movimientos_inventario fk_movimientos_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT fk_movimientos_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE RESTRICT;


--
-- TOC entry 5216 (class 2606 OID 16638)
-- Name: productos fk_productos_categoria; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT fk_productos_categoria FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria) ON DELETE RESTRICT;


--
-- TOC entry 5220 (class 2606 OID 16667)
-- Name: servicios fk_servicios_tipo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT fk_servicios_tipo FOREIGN KEY (id_tipo_servicio) REFERENCES public.tipos_servicio(id_tipo_servicio) ON DELETE RESTRICT;


--
-- TOC entry 5229 (class 2606 OID 16729)
-- Name: sesiones fk_sesiones_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT fk_sesiones_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 5214 (class 2606 OID 16618)
-- Name: usuarios fk_usuarios_rol; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol) ON DELETE RESTRICT;


-- Completed on 2026-08-31 22:20:00

--
-- PostgreSQL database dump complete
--

\unrestrict ymZalTx1jgSIlCx0UtyyMbBACvRsa6Zub1huwnpG27nbuJ6Y4J0nh6IbQuITB3c

